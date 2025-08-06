#!/usr/bin/env bash
set -euo pipefail

echo "▶ Uninstall any broken compass-mcp …"
npm uninstall compass-mcp >/dev/null 2>&1 || true

echo "▶ Install Compass MCP from GitHub …"
npm i -D git+https://github.com/mcp-org/compass-mcp.git

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"; [[ -f $cfg ]] || { echo "❌ $cfg not found"; exit 1; }

echo "▶ Patching .mcp.json compass entry …"
jq '(.mcpServers.compass) = {
      command:"npx",
      args:["-y","compass-mcp"]
    }' "$cfg" > "$cfg.tmp" && mv "$cfg.tmp" "$cfg"

# ------------------------------------------------------------------
# If the helper script you created earlier isn't present, recreate it
# ------------------------------------------------------------------
if [[ ! -f fix_and_launch_mcps.sh ]]; then
  cat > fix_and_launch_mcps.sh <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
logdir="$HOME/.claude-mcp-logs"; mkdir -p "$logdir"

declare -a CMDS=(
  "memory-bank-mcp --port 7010"
  "mcp-knowledge-graph --port 7020"
  "@modelcontextprotocol/server-sequential-thinking"
  "@executeautomation/playwright-mcp-server"
  "compass-mcp"
  "duckduckgo-mcp-server"
  "@modelcontextprotocol/server-github"
  "server-puppeteer"
)

npm ls --depth=0 --silent concurrently >/dev/null 2>&1 || npm i -D concurrently >/dev/null
for c in "${CMDS[@]}"; do
  bin=${c%% *}; npm ls --depth=0 --silent "$bin" >/dev/null 2>&1 || npm i -D "$bin" >/dev/null || true
done

running=()
pending=()
for c in "${CMDS[@]}"; do
  port=$(echo "$c" | grep -oE '--port [0-9]+' | awk '{print $2}' || true)
  if [[ -n $port ]] && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
    running+=("$c")
  else
    pending+=("$c")
  fi
done

[[ ${#pending[@]} -gt 0 ]] && npx concurrently -k "${pending[@]}" >"$logdir/all.log" 2>&1 &

{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for c in "${CMDS[@]}"; do echo "  \"$c\" \\"; done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

echo "✓ Servers currently listening: ${#running[@]}"
echo "✓ Started/kept ${#pending[@]} servers (logs → $logdir/all.log)"
SCRIPT
  chmod +x fix_and_launch_mcps.sh
fi

echo "▶ Launching/refreshing all MCP servers …"
./fix_and_launch_mcps.sh

echo
echo "All done!  In Claude chat run:"
echo "   /settings reload"
echo "   /mcp           → click Allow for each server"
