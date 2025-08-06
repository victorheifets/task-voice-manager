#!/usr/bin/env bash
set -euo pipefail
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cfg="$root/.mcp.json"; tmp=$(mktemp)

jq 'del(.mcpServers.compass)' "$cfg" > "$tmp" && mv "$tmp" "$cfg"
grep -v 'compass-mcp' start-mcps.sh > start-mcps.sh.tmp && mv start-mcps.sh.tmp start-mcps.sh
chmod +x start-mcps.sh

echo "Compass removed.  Now run in Claude chat:"
echo "   /settings reload   then   /mcp   (click Allow)"
