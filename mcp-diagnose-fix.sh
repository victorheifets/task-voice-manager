#!/usr/bin/env bash
set -e

COL_RED=$'\033[0;31m'; COL_GRN=$'\033[0;32m'; COL_YEL=$'\033[0;33m'; COL_RST=$'\033[0m'

# 0) Which .mcp.json is Claude using?
echo "▶ locating .mcp.json Claude will load …"
SEARCH_DIR="$PWD"
while [[ "$SEARCH_DIR" != / ]]; do
  if [[ -f "$SEARCH_DIR/.mcp.json" ]]; then
    MCP_JSON="$SEARCH_DIR/.mcp.json"
    break
  fi
  SEARCH_DIR=$(dirname "$SEARCH_DIR")
done
if [[ -z "${MCP_JSON:-}" ]]; then
  echo "${COL_RED}❌  No .mcp.json found upward from $PWD${COL_RST}"
  exit 1
fi
echo "   using: $MCP_JSON"

# 1) gather server list (name, command, args…)
TMP=$(mktemp)
jq -r '.mcpServers | to_entries[]
        | [.key, .value.command, (.value.args // []) | join(" ")] | @tsv' \
        "$MCP_JSON" > "$TMP"

PASS=(); FAIL=(); MISS=()

echo
printf '%-18s │ %-8s │ %-35s\n' "Server" "Status" "Notes"
printf '%.0s─' {1..70}; echo

while IFS=$'\t' read -r NAME CMD ARGS; do
  NOTE=""
  if [[ "$CMD" == "npx" ]]; then
    PKG=$(printf '%s\n' $ARGS | awk '{print $1}')
    if npm ls --depth=0 --silent "$PKG" >/dev/null 2>&1 || npm view "$PKG" >/dev/null 2>&1; then
      :
    else
      MISS+=("$PKG")
      printf '%-18s │ %s │ %-35s\n' "$NAME" "${COL_RED}MISSING${COL_RST}" "$PKG not installed"
      continue
    fi
    # try a 5-second boot test
    npx --yes "$PKG" --help >/dev/null 2>&1 &
    PID=$!
    sleep 2
    if ps -p $PID >/dev/null 2>&1; then
      kill $PID >/dev/null 2>&1 || true
      PASS+=("$NAME|$PKG")
      printf '%-18s │ %s │ %-35s\n' "$NAME" "${COL_GRN}OK${COL_RST}" "$PKG"
    else
      FAIL+=("$NAME|$PKG")
      printf '%-18s │ %s │ %-35s\n' "$NAME" "${COL_YEL}FAIL${COL_RST}" "boot error — see logs"
    fi
  else
    # non-npx command
    if command -v "$CMD" >/dev/null 2>&1; then
      PASS+=("$NAME|$CMD")
      printf '%-18s │ %s │ %-35s\n' "$NAME" "${COL_GRN}OK${COL_RST}" "$CMD"
    else
      FAIL+=("$NAME|$CMD")
      printf '%-18s │ %s │ %-35s\n' "$NAME" "${COL_RED}MISSING${COL_RST}" "$CMD not in PATH"
    fi
  fi
done < "$TMP"
rm "$TMP"

echo

# 2) Offer quick-fix for missing npm packages
if ((${#MISS[@]})); then
  echo "${COL_YEL}⚠  Missing packages detected:${COL_RST}"
  printf '   %s\n' "${MISS[@]}"
  read -p "→ Install them locally now? [y/N] " RESP
  if [[ "$RESP" == [yY]* ]]; then
    echo "npm install --save-dev ${MISS[*]}"
    npm install --save-dev "${MISS[@]}"
    echo "   done."
  fi
fi

# 3) re-build start-script with only servers that PASS (after optional install)
echo "▶ rewriting start-mcps.sh with passing servers…"
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for entry in "${PASS[@]}"; do
    NAME=${entry%%|*}; BIN=${entry#*|}
    case "$BIN" in
      memory-bank-mcp*)           CMD='memory-bank-mcp --port 7010' ;;
      mcp-knowledge-graph*)       CMD='mcp-knowledge-graph --port 7020' ;;
      mcp-server-supabase*)       CMD='mcp-server-supabase' ;;
      mcp-handler)                CMD='mcp-handler' ;;
      mcp-vercel)                 CMD='mcp-vercel' ;;
      mcp-remote)                 CMD='mcp-remote' ;;
      *)                          CMD="$BIN" ;;
    esac
    echo "  \"$CMD\" \\"
  done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

echo
echo "${COL_GRN}✅  start-mcps.sh updated with $((${#PASS[@]})) server(s).${COL_RST}"
if ((${#FAIL[@]})); then
  echo "${COL_YEL}⚠  Servers that still fail to boot (check logs manually):${COL_RST}"
  for e in "${FAIL[@]}"; do echo "   ${e%%|*} (${e#*|})"; done
fi
echo
echo "Run ./start-mcps.sh, wait a few seconds, then in Claude do:"
echo "   /mcp   → Allow each listed server"
