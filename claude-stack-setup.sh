#!/usr/bin/env bash
###############################################################################
# claude-full-setup.sh – ONE-SHOT installer for Claude Code + all MCP servers
###############################################################################
set -euo pipefail

### ─────────────────────────  Ports  ─────────────────────────
: "${MEMORY_PORT:=7010}"
: "${KG_PORT:=7020}"
: "${CACHE_PORT:=7030}"

### ─────────────────────  Pre-flight checks  ─────────────────
command -v node >/dev/null 2>&1 || { echo "❌  Node required"; exit 1; }
node -v | grep -q "^v2[0-9]"   || { echo "❌  Node ≥ 20 required"; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "❌  Git required";  exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌  Python 3 required"; exit 1; }

### ─────────────────────  Create venv  ───────────────────────
if [[ ! -d .claude-env ]]; then
  python3 -m venv .claude-env
fi
source .claude-env/bin/activate

pip install --quiet --upgrade pip
pip install --quiet requests trufflehog

### make Claude use this python
echo "export CLAUDE_CODE_PYTHON=\"$(pwd)/.claude-env/bin/python\"" >> ~/.zshrc

### ───────────────  Directory scaffold  ──────────────────────
mkdir -p .claude/{hooks,commands,logs}

### ───────────────  settings.json  ───────────────────────────
cat > .claude/settings.json <<JSON
{
  "model": "claude-3-sonnet-20250219",
  "enableAllProjectMcpServers": true,
  "permissions": {
    "allow": ["Read(**)","Edit","Write","MultiEdit","Bash(*)","WebFetch","WebSearch","mcp__*__*"],
    "deny":  ["Bash(rm -rf:*)","Bash(dd if=*:*)","Bash(curl |*:*)","Bash(wget |*:*)","Bash(chmod 777:*)"],
    "defaultMode": "acceptEdits"
  },
  "env": {
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "8192",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-haiku-20250220",
    "MCP_MEMORY_PORT": "$MEMORY_PORT",
    "MCP_KG_PORT": "$KG_PORT"
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",               "hooks": [ { "type": "command", "command": ".claude/hooks/validate_bash.py" } ] },
      { "matcher": "Write|Edit|MultiEdit","hooks": [ 
          { "type": "command", "command": ".claude/hooks/secret_scan.py" },
          { "type": "command", "command": ".claude/hooks/diff_guard.py" } ] },
      { "matcher": "Grep|Glob",          "hooks": [ { "type": "command", "command": ".claude/hooks/smart_grep.py" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Write|Edit|MultiEdit", "hooks": [ { "type": "command", "command": ".claude/hooks/auto_format.py" } ] },
      { "matcher": ".*", "hooks": [ 
          { "type": "command", "command": ".claude/hooks/save_memory.py" } ] }
    ],
    "UserPromptSubmit": [
      { "matcher": ".*", "hooks": [ { "type": "command", "command": ".claude/hooks/context_guard.py" } ] }
    ],
    "Stop": [
      { "matcher": ".*", "hooks": [ { "type": "command", "command": ".claude/hooks/auto_commit.py" } ] }
    ]
  }
}
JSON

### ───────────────  mcp.json  ────────────────────────────────
cat > .mcp.json <<JSON
{
  "mcpServers": {
    "memory-bank": { "command": "npx", "args": ["-y","@alioshr/memory-bank-mcp@latest","--port","$MEMORY_PORT"] },
    "kg-memory":   { "command": "npx", "args": ["-y","@shaneholloman/mcp-knowledge-graph@latest","--port","$KG_PORT"] },
    "cache":       { "command": "npx", "args": ["-y","@tosin2013/mcp-memory-cache-server@latest","--port","$CACHE_PORT"] },
    "sequential":  { "command": "npx", "args": ["-y","@modelcontextprotocol/server-sequential-thinking@latest"] },
    "serena":      { "command": "npx", "args": ["-y","@oraios/serena@latest"] },
    "playwright":  { "command": "npx", "args": ["-y","@microsoft/playwright-mcp@latest"] },
    "puppeteer":   { "command": "npx", "args": ["-y","@modelcontextprotocol/server-puppeteer@latest"] },
    "github":      { "command": "npx", "args": ["-y","github-mcp-server@latest"] },
    "openagents":  { "command": "npx", "args": ["-y","openagents-mcp@latest"] },
    "compass":     { "command": "npx", "args": ["-y","mcp-compass@latest"] },
    "desktop":     { "command": "npx", "args": ["-y","desktop-commander-mcp@latest"] },
    "duckduckgo":  { "command": "npx", "args": ["-y","duckduckgo-mcp-server@latest"] }
  }
}
JSON

### ───────────────  minimal hooks  ───────────────────────────
cat > .claude/hooks/secret_scan.py <<'PY'
#!/usr/bin/env python3
import sys, json, re
from trufflehog.regexes import regexes
payload = json.load(sys.stdin); txt=" ".join(map(str,payload.get("args",[])))
block = any(re.search(p["regex"], txt) for p in regexes.values())
json.dump({"permissionDecision": "deny" if block else "allow",
           "additionalContext": "🔑 secret detected" if block else ""}, sys.stdout)
sys.exit(2 if block else 0)
PY
chmod +x .claude/hooks/secret_scan.py

# (Other small hooks would be added similarly…)

### ───────────────  slash-commands  ──────────────────────────
printf '%s\n' "---\ndescription: Opus\nallowed-tools: config\n---\n**Action:** /config set model claude-3-opus-20250229"   > .claude/commands/opus.md
printf '%s\n' "---\ndescription: Sonnet\nallowed-tools: config\n---\n**Action:** /config set model claude-3-sonnet-20250219" > .claude/commands/sonnet.md
printf '%s\n' "---\ndescription: Haiku\nallowed-tools: config\n---\n**Action:** /config set model claude-3-haiku-20250220"   > .claude/commands/haiku.md

### ───────────────  start MCP servers  ───────────────────────
pids_file=".claude/logs/mcps.pid"
> "$pids_file"   # truncate

start () { # name pkg port extra
  local n=$1 p=$2 port=$3 extra=$4
  if [[ -n $port && $(nc -z localhost "$port"; echo $?) -eq 0 ]]; then
    echo "⏩  $n already on port $port"
    return
  fi
  echo "▶  $n starting..."
  # shellcheck disable=SC2086
  nohup npx --yes "$p@latest" $extra >/dev/null 2>&1 &
  echo "$! # $n" >> "$pids_file"
  echo "    pid $!"
}

start "Memory Bank"          @alioshr/memory-bank-mcp           "$MEMORY_PORT" "--port $MEMORY_PORT"
start "Knowledge-Graph"      @shaneholloman/mcp-knowledge-graph "$KG_PORT"     "--port $KG_PORT"
start "Lightning Cache"      @tosin2013/mcp-memory-cache-server "$CACHE_PORT"  "--port $CACHE_PORT"
start "Sequential Thinking"  @modelcontextprotocol/server-sequential-thinking "" ""
start "Serena"               @oraios/serena                      "" ""
start "Playwright MCP"       @microsoft/playwright-mcp           "" ""
start "Puppeteer MCP"        @modelcontextprotocol/server-puppeteer "" ""
start "GitHub MCP"           github-mcp-server                   "" ""
start "OpenAgents"           openagents-mcp                      "" ""
start "Compass"              mcp-compass                         "" ""
start "Desktop Commander"    desktop-commander-mcp               "" ""
start "DuckDuckGo Search"    duckduckgo-mcp-server               "" ""

### ───────────────  playwright browsers  ────────────────────
npx --yes playwright@latest install --with-deps >/dev/null 2>&1 || true

echo -e "\n✅  Claude stack ready."
echo "   • Activate this venv next time:  source .claude-env/bin/activate"
echo "   • Start Claude:                  claude /init    (then /mcp → Allow all)"
echo "   • Stop MCPs:                     kill \$(cat $pids_file | cut -d' ' -f1)"
