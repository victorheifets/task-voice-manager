#!/usr/bin/env bash
set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"
[[ -f $cfg ]] || { echo "❌ $cfg not found"; exit 1; }

logdir="$HOME/.claude-mcp-logs"; mkdir -p "$logdir"

printf '%-15s │ %-7s │ %-s\n' "Server" "Status" "Note"
printf '%.0s─' {1..60}; echo

jq -r '.mcpServers|to_entries[]|[.key,.value]|@json' "$cfg" |
while read -r line; do
  name=$(echo "$line" | jq -r '.[0]')
  cmd=$(echo "$line"  | jq -r '.[1].command')
  args=($(echo "$line" | jq -r '.[1].args[]'))
  port=$(echo "${args[@]}" | grep -oE '--port [0-9]+' | awk '{print $2}' || true)

  running=false
  if [[ -n $port ]] && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
    running=true
    printf '%-15s │ \033[0;32m%-7s\033[0m │ port %s\n' "$name" "running" "$port"
  fi

  if ! $running; then
    logfile="$logdir/$name.log"
    nohup $cmd "${args[@]}" >"$logfile" 2>&1 &
    sleep 2
    if [[ -n $port ]] && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
      printf '%-15s │ \033[0;32m%-7s\033[0m │ now listening (log: %s)\n' \
             "$name" "started" "$logfile"
    else
      printf '%-15s │ \033[0;31m%-7s\033[0m │ see %s\n' \
             "$name" "failed" "$logfile"
    fi
  fi
done
