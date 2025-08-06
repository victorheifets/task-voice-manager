#!/usr/bin/env bash
set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
mcp="$root/.mcp.json"; [[ -f $mcp ]] || { echo "❌ $mcp not found"; exit 1; }

# name pkg port
MAP=$(cat <<'MAPEND'
memory-bank   memory-bank-mcp                         7010
kg-memory     mcp-knowledge-graph                     7020
cache         memory-bank-mcp                         7030
sequential    @modelcontextprotocol/server-sequential-thinking 0
serena        serena-mcp-server                       0
playwright    @executeautomation/playwright-mcp-server 0
github        @modelcontextprotocol/server-github     0
compass       compass-mcp                             0
desktop       @wonderwhy-er/desktop-commander         0
duckduckgo    duckduckgo-mcp-server                   0
MAPEND
)

# ---------- rewrite .mcp.json ----------
json='{"mcpServers":{'
while read -r name pkg port; do
  ((port)) && portArr="\"--port\",\"$port\"" || portArr=""
  json+="\"$name\":{\"command\":\"npx\",\"args\":[\"-y\",\"$pkg\"$([[ $portArr ]] && echo ,$portArr)]},"
done <<< "$MAP"
json=${json%,}'}'}      # trim trailing comma

echo "$json" | jq . > "$mcp"
echo "✓ .mcp.json rewritten"

# ---------- install packages ----------
need=()
while read -r _ pkg _; do
  npm ls --depth=0 --silent "$pkg" >/dev/null 2>&1 || need+=("$pkg")
done <<< "$MAP"
(( ${#need[@]} )) && npm i -D "${need[@]}"
npm ls --depth=0 --silent concurrently >/dev/null 2>&1 || npm i -D concurrently

# ---------- launch servers ----------
cmds=()
while read -r name pkg port; do
  [[ $name == cache ]] && continue
  if ((port)) && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "• $name already on $port"
  else
    case $name in
      memory-bank) cmd="memory-bank-mcp --port 7010" ;;
      kg-memory)   cmd="mcp-knowledge-graph --port 7020" ;;
      compass)     cmd="compass-mcp" ;;
      serena)      command -v serena-mcp-server >/dev/null 2>&1 && cmd="serena-mcp-server" || continue ;;
      *)           cmd="$pkg" ;;
    esac
    cmds+=("$cmd")
  fi
done <<< "$MAP"
[[ ${#cmds[@]} -gt 0 ]] && npx concurrently -k "${cmds[@]}" >/tmp/mcps.log 2>&1 &

# ---------- create launcher ----------
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for c in "${cmds[@]}"; do echo "  \"$c\" \\"; done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh
echo "✓ start-mcps.sh ready"

echo
echo "Now in Claude chat run:"
echo "   /settings reload"
echo "   /mcp             (click Allow)"
