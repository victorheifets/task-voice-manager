#!/usr/bin/env bash
###############################################################################
# start-all-mcps.sh – launch every MCP server defined in your .mcp.json
#                     (latest versions, backgrounded)
###############################################################################
set -euo pipefail

### ─── Ports (keep these in sync with .claude/settings.json) ──────────────────
: "${MEMORY_PORT:=7010}"
: "${KG_PORT:=7020}"
: "${CACHE_PORT:=7030}"

### ─── Helper: start one MCP if its port is free ─────────────────────────────
launch () {
  local name="$1" pkg="$2" port="$3" extra="${4:-}"

  # If a port is specified and already in use, skip
  if [[ -n "$port" ]]; then
    if nc -z localhost "$port" >/dev/null 2>&1 ; then
      echo "⏩  $name already running on $port – skipping"
      return
    fi
  fi

  echo "▶  Starting $name …"
  # shellcheck disable=SC2086
  nohup npx --yes "$pkg@latest" $extra >/dev/null 2>&1 &
  echo "    $name pid $!"
}

###############################################################################
# 1. Core memory + cache servers (explicit ports)
###############################################################################
launch "Memory Bank"          @alioshr/memory-bank-mcp           "$MEMORY_PORT" "--port $MEMORY_PORT"
launch "Knowledge-Graph"      @shaneholloman/mcp-knowledge-graph "$KG_PORT"     "--port $KG_PORT"
launch "Lightning Cache"      @tosin2013/mcp-memory-cache-server "$CACHE_PORT"  "--port $CACHE_PORT"

###############################################################################
# 2. Planning, browser, code, search, orchestration servers (default ports)
###############################################################################
launch "Sequential Thinking"  @modelcontextprotocol/server-sequential-thinking "" ""
launch "Serena"               @oraios/serena                      "" ""
launch "Playwright MCP"       @microsoft/playwright-mcp           "" ""
launch "Puppeteer MCP"        @modelcontextprotocol/server-puppeteer "" ""
launch "GitHub MCP"           github-mcp-server                   "" ""
launch "OpenAgents Router"    openagents-mcp                      "" ""
launch "MCP Compass"          mcp-compass                         "" ""
launch "Desktop Commander"    desktop-commander-mcp               "" ""
launch "DuckDuckGo Search"    duckduckgo-mcp-server               "" ""

echo "✅  All requested MCP servers processed (started or skipped)."
echo "   Use 'ps' or 'jobs -l' to view running PIDs, or 'kill <pid>' to stop."
