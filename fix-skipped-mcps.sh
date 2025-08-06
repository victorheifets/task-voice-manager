#!/usr/bin/env bash
set -euo pipefail

# ───────────── missing → source map (quoted keys) ─────────────
declare -A MAP=(
  ["mcp-memory-cache-server"]="git+https://github.com/tosin2013/mcp-memory-cache-server.git"
  ["@oraios/serena"]="git+https://github.com/orai-os/serena.git"
  ["server-puppeteer"]="git+https://github.com/modelcontext/server-puppeteer.git"
  ["github-mcp-server"]="git+https://github.com/still-drey/github-mcp-server.git"
  ["openagents-mcp"]="git+https://github.com/openagents/openagents-mcp.git"
  ["mcp-compass"]="git+https://github.com/mcp-org/mcp-compass.git"
  ["desktop-commander-mcp"]="git+https://github.com/desktop-commander/desktop-commander-mcp.git"
)

# list already present packages
INSTALLED=()
for pkg in $(jq -r '.devDependencies | keys[]' package.json 2>/dev/null || true); do
  INSTALLED+=("$pkg")
done

ADDED=()

echo "▶  Installing missing MCPs…"
for key in "${!MAP[@]}"; do
  if printf '%s\n' "${INSTALLED[@]}" | grep -qx "$key"; then
    echo "   • $key already in node_modules – skipping"
    continue
  fi
  src="${MAP[$key]}"
  echo "   • $key ← $src"
  npm install --save-dev "$src" >/dev/null
  ADDED+=("$key")
done

# ensure concurrently exists
npm ls --depth=0 --silent | grep -q concurrently || npm install --save-dev concurrently >/dev/null

# ───────────── rebuild launcher ───────────────────────────────
echo "▶  Rewriting start-mcps.sh …"
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  # core services (should already be present)
  echo '  "memory-bank-mcp --port 7010" \'
  echo '  "mcp-knowledge-graph --port 7020" \'
  # add all currently installed mcp-* packages except the core two
  for pkg in $(jq -r '.devDependencies | keys[]' package.json); do
    case "$pkg" in
      memory-bank-mcp|mcp-knowledge-graph) : ;;
      mcp-memory-cache-server)             echo '  "mcp-memory-cache-server --port 7030" \';;
      *)                                   echo "  \"$pkg\" \\";;
    esac
  done
} > start-mcps.sh
# remove final trailing backslash
sed -i '' '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

echo
echo "✅  Added ${#ADDED[@]} new package(s):"
printf '   %s\n' "${ADDED[@]:-none}"
echo
echo "Run ./start-mcps.sh  (keep that tab open)."
echo "Then in Claude: /init  →  /mcp  →  Allow each server listed."
