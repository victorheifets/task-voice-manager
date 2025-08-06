#!/usr/bin/env bash
###############################################################################
# claude-diagnose.sh – quick snapshot of everything Claude Code needs
###############################################################################
set -euo pipefail

echo "─── Working dir ─────────────────────────────────────────────"
pwd
echo "─── File presence ───────────────────────────────────────────"
ls -a .claude/settings.json .mcp.json 2>/dev/null || {
  echo "❌  .claude/settings.json or .mcp.json missing"; exit 1; }

echo -e "\n─── Validate JSON syntax ───────────────────────────────────"
for f in .claude/settings.json .mcp.json; do
  printf "%s … " "$f"
  jq empty "$f" >/dev/null && echo "OK" || { echo "❌  invalid JSON"; exit 1; }
done

echo -e "\n─── Claude /doctor summary ─────────────────────────────────"
claude /doctor | sed -n '/Settings files read/,/Press Enter/ p'

echo -e "\n─── MCP servers declared in .mcp.json ─────────────────────"
jq -r '.mcpServers | to_entries[] | .key + " → " + (.value.args|tostring)' .mcp.json

echo -e "\n─── Listening ports (7010-7050) ───────────────────────────"
for p in {7010..7050}; do
  if lsof -n -i :"$p" -sTCP:LISTEN 2>/dev/null | grep -q node; then
    echo "✔ port $p open ($(lsof -n -i :"$p" -sTCP:LISTEN -P -F n | head -1 | cut -d: -f2))"
  fi
done

echo -e "\n─── Python import check ────────────────────────────────────"
python3 - <<'PY'
try:
    import requests; from trufflehog.regexes import regexes
    print("✓ requests", requests.__version__)
    print("✓ trufflehog regex patterns", len(regexes))
except Exception as e:
    print("❌", e)
PY

echo -e "\nDone.  Look for ❌ above if any."
