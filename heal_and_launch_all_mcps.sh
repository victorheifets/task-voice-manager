#!/usr/bin/env bash
set -euo pipefail

# ── 0. prerequisite check ─────────────────────────────────────────────
command -v node >/dev/null || { echo "❌ Node.js required"; exit 1; }
command -v npm  >/dev/null || { echo "❌ npm required";  exit 1; }

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
mcp_json="$root/.mcp.json"
[[ -f "$mcp_json" ]] || { echo "❌ $mcp_json not found"; exit 1; }

# ── 1. canonical mapping (failing name → good pkg + default port) ─────
declare -A PKG PORT
PKG[memory-bank]="memory-bank-mcp"               ; PORT[memory-bank]=7010
PKG[kg-memory]="mcp-knowledge-graph"             ; PORT[kg-memory]=7020
PKG[cache]="memory-bank-mcp"                     ; PORT[cache]=7030   # built-in cache
PKG[playwright]="@executeautomation/playwright-mcp-server"
PKG[puppeteer]="server-puppeteer"                # optional
PKG[github]="@modelcontextprotocol/server-github"
PKG[openagents]="openagents-mcp"
PKG[compass]="compass-mcp"                       # new repo name
PKG[desktop]="@wonderwhy-er/desktop-commander"
PKG[duckduckgo]="duckduckgo-mcp-server"
PKG[serena]="serena-mcp-server"                  # requires uvx
# sequential already works (no port)

# ── 2. patch .mcp.json to good package names ──────────────────────────
tmp=$(mktemp)
jq --argjson map "$(printf '{%s}' \
  "$(printf '"%s":"%s",' "${!PKG[@]}" "${PKG[@]}" | sed 's/,$//')")" '
  .mcpServers as $orig |
  reduce ($map | to_entries[]) as $e ($orig;
    if has($e.key)
       then .[$e.key].command = "npx"
            | .[$e.key].args  = ["-y", $e.value] + (
                if $e.key|test("memory-bank|kg-memory") then ["--port", ($e.key=="memory-bank"? "7010":"7020")] else [] end)
       else .
    end)' "$mcp_json" > "$tmp"
mv "$tmp" "$mcp_json"
echo "✓ .mcp.json package names normalised"

# ── 3. install any missing npm packages ───────────────────────────────
need=()
for name in "${!PKG[@]}"; do
  pkg=${PKG[$name]}
  npm ls --depth=0 --silent "$pkg" >/dev/null 2>&1 || need+=("$pkg")
done
if ((${#need[@]})); then
  echo "▶ installing ${need[*]}"
  npm install --save-dev "${need[@]}" >/dev/null
fi
npm ls --depth=0 --silent concurrently >/dev/null 2>&1 || npm i --save-dev concurrently >/dev/null

# ── 4. start servers that are down ────────────────────────────────────
launch_cmds=()
for name in "${!PKG[@]}"; do
  pkg=${PKG[$name]}
  port=${PORT[$name]:-0}
  if ((port)) && lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "• $name already listening on $port"
  else
    case $name in
      memory-bank)  cmd="memory-bank-mcp --port 7010" ;;
      kg-memory)    cmd="mcp-knowledge-graph --port 7020" ;;
      cache)        continue ;;          # built-in
      compass)      cmd="compass-mcp" ;;
      serena)       command -v serena-mcp-server >/dev/null 2>&1 && cmd="serena-mcp-server" || continue ;;
      *)            cmd="$pkg" ;;
    esac
    launch_cmds+=("\"$cmd\"")
  fi
done

if ((${#launch_cmds[@]})); then
  echo "▶ starting ${#launch_cmds[@]} server(s)…"
  # shell-safe join
  joined=$(printf ",%s" "${launch_cmds[@]}")
  joined=${joined:1}
  npx concurrently -k ${joined//,/ } &
  echo "   (running in background)"
else
  echo "✓ all servers already running"
fi

# ── 5. regenerate start-mcps.sh ───────────────────────────────────────
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for name in "${!PKG[@]}"; do
    case $name in
      memory-bank)  echo '  "memory-bank-mcp --port 7010" \';;
      kg-memory)    echo '  "mcp-knowledge-graph --port 7020" \';;
      cache)        : ;; # skip separate cache
      compass)      echo '  "compass-mcp" \';;
      serena)       echo '  "serena-mcp-server" \';;
      *)            echo "  \"${PKG[$name]}\" \\";;
    esac
  done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh
echo "✓ start-mcps.sh written"

echo
echo "All set.  In Claude chat run:"
echo "   /settings reload"
echo "   /mcp           → click Allow for each server"
