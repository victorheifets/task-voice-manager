#!/usr/bin/env bash
set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"; [[ -f $cfg ]] || { echo "❌ $cfg not found"; exit 1; }

logdir="$HOME/.claude-mcp-logs"; mkdir -p "$logdir"

# name   pkg                                             port
MCPS="
memory-bank   memory-bank-mcp                          7010
kg-memory     mcp-knowledge-graph                      7020
cache         memory-bank-mcp                          7030
playwright    @executeautomation/playwright-mcp-server 0
github        @modelcontextprotocol/server-github      0
compass       compass-mcp                              0
desktop       @wonderwhy-er/desktop-commander          0
openagents    openagents-mcp                           0
serena        serena-mcp-server                        0
"

# ---------- ensure packages ----------
need=()
while read -r _ pkg _; do
  [[ -z $pkg ]] && continue
  npm ls --depth 0 --silent "$pkg" >/dev/null 2>&1 || need+=("$pkg")
done <<< "$MCPS"
(( ${#need[@]} )) && npm i -D "${need[@]}"
npm ls --depth 0 --silent concurrently >/dev/null 2>&1 || npm i -D concurrently

# ---------- rewrite .mcp.json ----------
jq -n --argfile old "$cfg" '
  def mk($cmd;$pkg;$port):
    {command:"npx",args:["-y",$pkg] + ( $port>0?["--port",($port|tostring)]:[] )};
  ($old.mcpServers // {}) as $orig |
  (
    '"$(printf '%s\n' "$MCPS" | awk '{print "    \""$1"\": mk(\"npx\",\""$2"\","$3"),"}')"'
    null
  ) |
  {mcpServers: ( $orig + (.[0:-1]) ) }' > "$cfg.tmp" && mv "$cfg.tmp" "$cfg"

echo "✓ .mcp.json refreshed"

# ---------- launch down servers ----------
launch=()
while read -r name pkg port; do
  [[ $name == cache ]] && continue        # built-in
  running=false
  ((port)) && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1 && running=true
  if ! $running; then
    case $name in
      memory-bank) cmd="memory-bank-mcp --port 7010" ;;
      kg-memory)   cmd="mcp-knowledge-graph --port 7020" ;;
      compass)     cmd="compass-mcp" ;;
      serena)      command -v serena-mcp-server >/dev/null 2>&1 && cmd="serena-mcp-server" || { echo "⚠ serena skipped (uvx missing)"; continue; } ;;
      *)           cmd="$pkg" ;;
    esac
    launch+=("$cmd")
  fi
done <<< "$MCPS"

if (( ${#launch[@]} )); then
  npx concurrently -k "${launch[@]}" > "$logdir/all.log" 2>&1 &
  echo "▶ started: ${launch[*]}  (logs → $logdir)"
else
  echo "✓ all required servers already running"
fi

# ---------- regenerate launcher ----------
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for l in "${launch[@]}"; do echo "  \"$l\" \\"; done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh
echo "✓ start-mcps.sh updated"

echo
echo "Now in Claude chat:"
echo "   /settings reload"
echo "   /mcp           → click Allow"
