#!/usr/bin/env python3
"""self-contained secret scanner – no external imports needed"""
import sys, json, re
PATTERNS = [
    r'AKIA[0-9A-Z]{16}',             # AWS Access Key
    r'ghp_[0-9A-Za-z]{36}',          # GitHub PAT
    r'sk-[0-9A-Za-z]{48}',           # OpenAI key
    r'xox[baprs]-[0-9A-Za-z-]{10,}', # Slack token
    r'AIza[0-9A-Za-z-_]{35}',        # Google API key
    r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' # UUID
]
payload = json.load(sys.stdin)
txt = " ".join(map(str, payload.get("args", [])))
blocked = any(re.search(p, txt) for p in PATTERNS)
json.dump({
    "permissionDecision": "deny" if blocked else "allow",
    "additionalContext": "🔑 potential secret detected" if blocked else ""
}, sys.stdout)
sys.exit(2 if blocked else 0)
