#!/usr/bin/env bash
set -e  # stop on first error (no -u, avoids “unbound variable”)

# ------------------------------------------------------------------
# 1. make sure project has a package.json
# ------------------------------------------------------------------
[[ -f package.json ]] || npm init -y >/dev/null

# ------------------------------------------------------------------
# 2. list of candidate MCP packages (scoped & unscoped)
#    comment out any you don't want
# ------------------------------------------------------------------
PACKAGES=(
  memory-bank-mcp
  mcp-knowledge-graph
  mcp-memory-cache-server
  @modelcontextprotocol/server-sequential-thinking
  @oraios/serena
  playwright-mcp
  server-puppeteer
  github-mcp-server
  openagents-mcp
  mcp-compass
  desktop-commander-mcp
  duckduckgo-mcp-server
)

INSTALLED=()
SKIPPED=()

echo "▶ Installing MCP servers…"
for pkg in "${PACKAGES[@]}"; do
  echo -n "   • $pkg … "
  if npm view "$pkg" >/dev/null 2>&1; then
    npm install --save-dev "$pkg" >/dev/null
    INSTALLED+=("$pkg")
    echo "OK"
  else
    SKIPPED+=("$pkg")
    echo "not found → skipped"
  fi
done

# always install concurrently (launcher helper)
npm ls --depth=0 --silent | grep -q concurrently || npm install --save-dev concurrently >/dev/null

# ------------------------------------------------------------------
# 3. build start-mcps.sh with only working packages
# ------------------------------------------------------------------
echo '#!/usr/bin/env bash'        >  start-mcps.sh
echo 'npx concurrently -k \'      >> start-mcps.sh

for pkg in "${INSTALLED[@]}"; do
  case "$pkg" in
    memory-bank-mcp)            CMD="memory-bank-mcp --port 7010" ;;
    mcp-knowledge-graph)        CMD="mcp-knowledge-graph --port 7020" ;;
    mcp-memory-cache-server)    CMD="mcp-memory-cache-server --port 7030" ;;
    *)                          CMD="$pkg" ;;
  esac
  echo "  \"$CMD\" \\" >> start-mcps.sh
done

# remove trailing backslash
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

# ------------------------------------------------------------------
# 4. summary
# ------------------------------------------------------------------
echo
echo "✅ Installed ${#INSTALLED[@]} MCP package(s):"
printf '   %s\n' "${INSTALLED[@]}"
if ((${#SKIPPED[@]})); then
  echo "⚠️  Skipped (not found on npm):"
  printf '   %s\n' "${SKIPPED[@]}"
fi
echo
echo "Run   ./start-mcps.sh   (keep that tab open)."
echo "Then in Claude chat:  /init   →   /mcp   →   Allow each server."
