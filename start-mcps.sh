#!/usr/bin/env bash
mkdir -p ~/.claude-mcp-logs
need=()
for port in 7010 7020; do
  lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1 || need+=(true)
done
if [ ${#need[@]} -eq 0 ]; then
  echo "✔ servers already running"; exit 0
fi
npx concurrently -k \
  "memory-bank-mcp --port 7010" \
  "mcp-knowledge-graph --port 7020" \
  "@modelcontextprotocol/server-sequential-thinking" \
  "@executeautomation/playwright-mcp-server" \
  > ~/.claude-mcp-logs/all.log 2>&1 &
echo "▶ started servers – logs → ~/.claude-mcp-logs/all.log"
