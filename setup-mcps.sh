#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# SAFE MCP INSTALLER – skips packages that 404 on npm
###############################################################################

# 0. make sure we have a package.json
[[ -f package.json ]] || npm init -y >/dev/null

# 1. list of known-good package names (unscoped where necessary)
MCP_PKGS=(
  memory-bank-mcp
  mcp-knowledge-graph
  mcp-memory-cache-server
  @modelcontextprotocol/server-sequential-thinking
  @oraios/serena
  playwright-mcp        # unscoped variant
  server-puppeteer
  github-mcp-server
  openagents-mcp
  mcp-compass
  desktop-commander-mcp
  duckduckgo-mcp-server
)

SKIPPED=()
INSTALLED=()

echo "▶  Installing MCP servers…"

for pkg in "${MCP_PKGS[@]}"; do
  echo -n "   • $pkg … "
  if npm info "$pkg" >/dev/null 2>&1; then
    npm install --save-dev "$pkg" >/dev/null
    INSTALLED+=("$pkg")
    echo "OK"
  else
    SKIPPED+=("$pkg")
    echo "not found → skipped"
  fi
done

# always add concurrently
npm install --save-dev concurrently >/dev/null

# 2. write launcher with only installed packages
cat > start-mcps.sh <<'SCRIPT'
#!/usr/bin/env bash
npx concurrently -k \
SCRIPT

# build the concurrently command
for pkg in "${INSTALLED[@]}"; do
  case $pkg in
    memory-bank-mcp)
      echo "  \"memory-bank-mcp --port 7010\" \\" >> start-mcps.sh;;
    mcp-knowledge-graph)
      echo "  \"mcp-knowledge-graph --port 7020\" \\" >> start-mcps.sh;;
    mcp-memory-cache-server)
      echo "  \"mcp-memory-cache-server --port 7030\" \\" >> start-mcps.sh;;
    playwright-mcp)
      echo "  \"playwright-mcp\" \\" >> start-mcps.sh;;
    server-puppeteer)
      echo "  \"server-puppeteer\" \\" >> start-mcps.sh;;
    @modelcontextprotocol/server-sequential-thinking)
      echo "  \"server-sequential-thinking\" \\" >> start-mcps.sh;;
    @oraios/serena)
      echo "  \"serena\" \\" >> start-mcps.sh;;
    github-mcp-server)
      echo "  \"github-mcp-server\" \\" >> start-mcps.sh;;
    openagents-mcp)
      echo "  \"openagents-mcp\" \\" >> start-mcps.sh;;
    mcp-compass)
      echo "  \"mcp-compass\" \\" >> start-mcps.sh;;
    desktop-commander-mcp)
      echo "  \"desktop-commander-mcp\" \\" >> start-mcps.sh;;
    duckduckgo-mcp-server)
      echo "  \"duckduckgo-mcp-server\" \\" >> start-mcps.sh;;
  esac
done

# remove trailing backslash on last line
sed -i '' '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

echo
echo "✅  Installed: ${#INSTALLED[@]} package(s)"
printf '   %s\n' "${INSTALLED[@]}"
if ((${#SKIPPED[@]})); then
  echo "⚠️  Skipped (not on npm today):"
  printf '   %s\n' "${SKIPPED[@]}"
fi
echo
echo "Run ./start-mcps.sh (keep that tab open)."
echo "Then in Claude: /init  →  /mcp  →  Allow each listed server."
