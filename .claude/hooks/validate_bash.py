
#!/usr/bin/env python3
import sys,json,re,_log
try:
    cmd=json.load(sys.stdin).get("command","")
    deny=bool(re.search(r"\brm\s+-rf\b|\bcurl\s+[^\|]*\||\bwget\s+[^\|]*\||\bdd\s+if=|\bchmod\s+777\b",cmd))
    json.dump({"permissionDecision":"deny" if deny else "allow",
               "additionalContext":"🚫 blocked destructive shell" if deny else ""},sys.stdout)
    sys.exit(2 if deny else 0)
except Exception as e:
    _log.log_exc(e); json.dump({"permissionDecision":"allow"},sys.stdout); sys.exit(0)

