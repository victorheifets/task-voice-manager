#!/usr/bin/env bash
set -euo pipefail

# servers to delete (space-separated)
REMOVE="compass openagents serena cache"   # add / delete names here

# all possible config paths
paths=(
  "$HOME/.claude.json"
  ".mcp.json"
  ".claude.json"
)

for f in "${paths[@]}"; do
  [[ -f $f ]] || continue
  tmp=$(mktemp)
  jq --argjson nix "[\"${REMOVE// /\",\"}\"]" \
     'if .mcpServers
       then .mcpServers |= with_entries(select(.key as $k | ($nix | index($k) | not)))
       else .
      end' "$f" > "$tmp" && mv "$tmp" "$f"
  echo "✔ cleaned $f"
done

echo
echo "Now in Claude chat run:"
echo "   /settings reload"
echo "   /mcp            (Approve only the servers you really want)"
