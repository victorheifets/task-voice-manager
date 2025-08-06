#!/usr/bin/env bash
set -e

echo "▶ Node: $(node -v)  npm: $(npm -v)"

[[ -f package.json ]] || npm init -y >/dev/null

# ----- package list ---------------------------------------------------
PKGS="
memory-bank-mcp
mcp-knowledge-graph
@modelcontextprotocol/server-sequential-thinking
@executeautomation/playwright-mcp-server
@modelcontextprotocol/server-fetch
@modelcontextprotocol/server-filesystem
@supabase/mcp-server-supabase
mcp-handler
mcp-vercel
mcp-remote
@wonderwhy-er/desktop-commander
@modelcontextprotocol/server-github
git+https://github.com/mcp-org/mcp-compass.git
"

OK=() SKIP=()

echo "▶ Installing MCPs ..."
for src in $PKGS; do
  printf "   • %-55s" "$src"
  base="${src%%@*}"               # strip version if any
  base="${base##git+}"            # strip git+ for test
  base="${base%%.git}"            # strip .git for npm view
  if [[ "$src" == git+* ]] || npm view "$base" >/dev/null 2>&1 ; then
    npm install --save-dev "$src" >/dev/null 2>&1 && { OK+=("$src"); echo "OK"; } || { SKIP+=("$src"); echo "FAIL"; }
  else
    SKIP+=("$src"); echo "404"
  fi
done

# ----- optionally install Serena via uvx ------------------------------
if command -v uvx >/dev/null 2>&1 ; then
  echo -n "   • serena-mcp-server (uvx) … "
  if uvx --quiet --from git+https://github.com/oraios/serena serena-mcp-server >/dev/null 2>&1 ; then
    OK+=("serena-mcp-server"); echo "OK"
  else
    SKIP+=("serena-mcp-server (uvx install failed)"); echo "FAIL"
  fi
else
  SKIP+=("serena-mcp-server (uvx not found)")
fi

# make sure launcher helper exists
npm ls --depth=0 --silent | grep -q concurrently || npm install --save-dev concurrently >/dev/null

# ----- build start-script ---------------------------------------------
echo "▶ Writing start-mcps.sh"
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for p in "${OK[@]}"; do
    case "$p" in
      memory-bank-mcp*)          CMD='memory-bank-mcp --port 7010' ;;
      mcp-knowledge-graph*)      CMD='mcp-knowledge-graph --port 7020' ;;
      @supabase/mcp-server-supabase*) CMD='mcp-server-supabase' ;;
      git+https://github.com/mcp-org/mcp-compass.git) CMD='mcp-compass' ;;
      serena-mcp-server*)        CMD='serena-mcp-server' ;;
      *)                         # default: binary equals last path segment
         CMD=$(basename "${p%%@*}") ;;
    esac
    echo "  \"$CMD\" \\"
  done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

# ----- summary --------------------------------------------------------
echo
echo "✅ Installed ${#OK[@]} packages:"
printf '   %s\n' "${OK[@]}"
if ((${#SKIP[@]})); then
  echo "⚠️  Skipped:"
  printf '   %s\n' "${SKIP[@]}"
fi
echo
echo "Run ./start-mcps.sh (keep that tab open)"
echo "Then in Claude:  /init  →  /mcp  →  Allow each server."
