#!/usr/bin/env bash
set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"
[[ -f $cfg ]] || { echo "❌ $cfg not found"; exit 1; }

echo "▶ uninstalling any placeholder compass-mcp"
npm uninstall compass-mcp >/dev/null 2>&1 || true

echo "▶ installing Compass MCP via HTTPS tarball"
npm i -D https://github.com/mcp-org/compass-mcp/archive/refs/heads/main.tar.gz

echo "▶ patching .mcp.json"
tmp=$(mktemp)
jq '.mcpServers.compass = {command:"npx",args:["-y","compass-mcp"]}' \
   "$cfg" > "$tmp" && mv "$tmp" "$cfg"

echo "▶ ensuring core packages"
for p in memory-bank-mcp mcp-knowledge-graph \
         @modelcontextprotocol/server-sequential-thinking \
         @executeautomation/playwright-mcp-server \
         compass-mcp concurrently; do
  npm ls -s --depth 0 "$p" >/dev/null 2>&1 || npm i -D "$p"
done

echo "▶ starting any missing servers (background)"
mkdir -p ~/.claude-mcp-logs
start() { nohup "$@" > ~/.claude-mcp-logs/$1.log 2>&1 & }

lsof -i :7010 -sTCP:LISTEN >/dev/null || start memory-bank-mcp --port 7010
lsof -i :7020 -sTCP:LISTEN >/dev/null || start mcp-knowledge-graph --port 7020
pgrep -f server-sequential-thinking >/dev/null || \
  start $(npm root)/@modelcontextprotocol/server-sequential-thinking/bin/index.js
pgrep -f playwright-mcp-server     >/dev/null || start playwright-mcp-server
pgrep -f compass-mcp               >/dev/null || start compass-mcp

echo "▶ writing starter"
cat > start-mcps.sh <<'RUN'
#!/usr/bin/env bash
mkdir -p ~/.claude-mcp-logs
npx concurrently -k \
  "memory-bank-mcp --port 7010" \
  "mcp-knowledge-graph --port 7020" \
  "@modelcontextprotocol/server-sequential-thinking" \
  "@executeautomation/playwright-mcp-server" \
  "compass-mcp" \
  > ~/.claude-mcp-logs/all.log 2>&1
RUN
chmod +x start-mcps.sh

echo -e "\n✅  Core servers up (logs in ~/.claude-mcp-logs)"
echo   "In Claude chat run:"
echo   "   /settings reload"
echo   "   /mcp   → click Allow for each server"
