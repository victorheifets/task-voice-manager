#!/usr/bin/env bash
set -euo pipefail

echo "▶ step 1/4  Copy .mcp.json → ~/.claude.json (user scope)"
src_dir="$(pwd)"
[[ -f "$src_dir/.mcp.json" ]] || { echo "❌ .mcp.json not found in $src_dir"; exit 1; }
cp "$src_dir/.mcp.json" ~/.claude.json
echo "   ✔ copied to ~/.claude.json"

echo "▶ step 2/4  Launching MCP servers (./start-mcps.sh)…"
if pgrep -f 'memory-bank-mcp' >/dev/null 2>&1; then
  echo "   ✔ servers appear to be running already"
else
  chmod +x ./start-mcps.sh
  nohup ./start-mcps.sh >/tmp/mcps.log 2>&1 &
  echo "   ✔ backgrounded (logs in /tmp/mcps.log)"
  sleep 10   # give servers time to boot
fi

echo "▶ step 3/4  Quick port check"
for p in 7010 7020; do
  if lsof -i ":$p" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "   ✔ port $p listening"
  else
    echo "   ⚠ port $p NOT listening  (check /tmp/mcps.log)"
  fi
done

echo "▶ step 4/4  Next steps"
echo "   1. In the Claude chat pane type:   /settings reload"
echo "   2. Then type:                      /mcp"
echo "      → click **Allow** for each server that appears"
echo "Done."
