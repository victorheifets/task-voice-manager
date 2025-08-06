#!/usr/bin/env bash
set -euo pipefail

# where to put local MCP checkouts
base="$HOME/.local-mcps"; mkdir -p "$base"
dest="$base/compass-mcp"

if [[ ! -d $dest ]]; then
  echo "▶ cloning Compass MCP (HTTPS) …"
  git clone --depth=1 https://github.com/mcp-org/compass-mcp.git "$dest"
  ( cd "$dest" && npm install --silent )
fi

echo "▶ linking Compass MCP so npx can find it …"
(cd "$dest" && npm link --silent)

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"; [[ -f $cfg ]] || { echo "❌ .mcp.json not found"; exit 1; }

echo "▶ ensuring compass block exists in .mcp.json …"
tmp=$(mktemp)
jq '.mcpServers.compass = {
      command:"npx",
      args:["-y","compass-mcp"]
    }' "$cfg" > "$tmp" && mv "$tmp" "$cfg"

echo "▶ adding compass to launcher (start-mcps.sh) …"
grep -q 'compass-mcp' start-mcps.sh || \
  sed -i '' '2 a\
  "compass-mcp" \\' start-mcps.sh 2>/dev/null || \
  sed -i '2i\
  "compass-mcp" \\' start-mcps.sh

echo
echo "✅ Compass MCP installed & wired in."
echo "Run ./start-mcps.sh (or stop & restart it)."
echo "Then in Claude chat:  /settings reload  →  /mcp  →  Allow compass"
