#!/usr/bin/env bash
set -e

COLOR_RED=$'\033[0;31m'; COLOR_GRN=$'\033[0;32m'; COLOR_YEL=$'\033[0;33m'; COLOR_RST=$'\033[0m'

# 1) locate .mcp.json
HERE="$PWD"
while [[ "$HERE" != "/" && ! -f "$HERE/.mcp.json" ]]; do HERE=$(dirname "$HERE"); done
[[ -f "$HERE/.mcp.json" ]] || { echo "${COLOR_RED}❌  .mcp.json not found${COLOR_RST}"; exit 1; }
MCP="$HERE/.mcp.json"; echo "▶ Using $MCP"

# 2) normalise: string ➜ {command:npx,args:[pkg]}
TMP=$(mktemp)
jq '(.mcpServers|to_entries)|map(
      if (.value|type)=="string"
      then .value = {"command":"npx","args":[.value]}
      else .
      end) | from_entries | {mcpServers:.}' "$MCP" > "$TMP"
mv "$TMP" "$MCP"

# 3) extract list (name  command  arg0)
jq -r '.mcpServers|to_entries[]|
      [.key,.value.command, (.value.args//[])[0]]|@tsv' "$MCP" > .mcp_list.tsv

MISS=(); OK=(); FAIL=()

echo
printf '%-20s│ %-6s │ %-s\n' "Server" "Status" "Package/Binary"
printf '%.0s─' {1..60}; echo

while IFS=$'\t' read -r NAME CMD PKG; do
  if [[ "$CMD" == "npx" ]]; then
    if npm ls --depth 0 --silent "$PKG" >/dev/null 2>&1 || npm view "$PKG" >/dev/null 2>&1; then
      npx --yes "$PKG" --help >/dev/null 2>&1 & PID=$!
      sleep 1 && kill $PID 2>/dev/null || true
      OK+=("$NAME:$PKG"); printf '%-20s│ %s │ %s\n' "$NAME" "${COLOR_GRN}OK${COLOR_RST}" "$PKG"
    else
      MISS+=("$PKG"); printf '%-20s│ %s │ %s\n' "$NAME" "${COLOR_RED}MISS${COLOR_RST}" "$PKG"
    fi
  else
    command -v "$CMD" >/dev/null 2>&1 && { OK+=("$NAME:$CMD"); STATUS=OK; COL=$COLOR_GRN; } \
                                     || { FAIL+=("$NAME:$CMD"); STATUS=FAIL; COL=$COLOR_YEL; }
    printf '%-20s│ %s │ %s\n' "$NAME" "${COL}$STATUS${COLOR_RST}" "$CMD"
  fi
done < .mcp_list.tsv
echo

# 4) optional install missing pkgs
if ((${#MISS[@]})); then
  echo "${COLOR_YEL}Missing npm packages:${COLOR_RST} ${MISS[*]}"
  read -p "Install them now? [y/N] " ans
  if [[ $ans == [Yy]* ]]; then npm install --save-dev "${MISS[@]}"; fi
fi

# 5) create launcher
echo "▶ Writing start-mcps.sh"
{
  echo '#!/usr/bin/env bash'
  echo 'npx concurrently -k \'
  for entry in "${OK[@]}"; do
    IFS=: read -r NAME BIN <<<"$entry"
    case $BIN in
      memory-bank-mcp*)     CMD='memory-bank-mcp --port 7010' ;;
      mcp-knowledge-graph*) CMD='mcp-knowledge-graph --port 7020' ;;
      *)                    CMD="$BIN" ;;
    esac
    echo "  \"$CMD\" \\"
  done
} > start-mcps.sh
sed -i '' '$ s/ \\$//' start-mcps.sh 2>/dev/null || sed -i '$ s/ \\$//' start-mcps.sh
chmod +x start-mcps.sh

echo
echo "${COLOR_GRN}✅ start-mcps.sh ready with ${#OK[@]} servers.${COLOR_RST}"
[[ ${#FAIL[@]} -gt 0 ]] && { echo "${COLOR_YEL}⚠ Servers still failing:${COLOR_RST}"; printf '   %s\n' "${FAIL[@]}"; }
echo
echo "Run ./start-mcps.sh, wait a few seconds, then in Claude run: /mcp"
