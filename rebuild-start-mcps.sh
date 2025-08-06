#!/usr/bin/env bash
set -e

json_path="$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.mcp.json"
[[ -f $json_path ]] || { echo "❌ .mcp.json not found"; exit 1; }

tmp=$(mktemp)
jq -r '
  .mcpServers | to_entries[] |
  [
    .key,
    .value.command,
    ( (.value.args // []) | map(select(.|test("^--?")==false))[0] // "" )
  ] | @tsv' "$json_path" > "$tmp"

echo "▶ rebuilding start-mcps.sh …"
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  while IFS=$'\t' read -r name cmd pkg; do
    [[ -z $pkg ]] && continue
    case $pkg in
      memory-bank-mcp*)           line='memory-bank-mcp --port 7010' ;;
      mcp-knowledge-graph*)       line='mcp-knowledge-graph --port 7020' ;;
      mcp-server-supabase*)       line='mcp-server-supabase' ;;
      mcp-handler)                line='mcp-handler' ;;
      mcp-vercel)                 line='mcp-vercel' ;;
      mcp-remote)                 line='mcp-remote' ;;
      *)                          line="$pkg" ;;
    esac
    echo "  \"$line\" \\"
  done < "$tmp"
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh
rm "$tmp"

echo "✅ start-mcps.sh rebuilt.  Run it, wait 10 s, then in Claude type /mcp"
