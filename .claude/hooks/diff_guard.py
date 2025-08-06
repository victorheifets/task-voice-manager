
#!/usr/bin/env python3
import subprocess,sys,json,_log
try:
    if subprocess.call(["git","rev-parse","--is-inside-work-tree"],stdout=subprocess.DEVNULL): sys.exit(0)
    changes=subprocess.check_output(["git","diff","--cached","--numstat"]).decode().splitlines()
    big=[l for l in changes if sum(int(x) if x!="-\" else 0 for x in l.split("\t")[:2])>400]
    if big:
        json.dump({"permissionDecision":"ask",
                   "additionalContext":f"⚠️ {len(big)} large rewrites – explain."},sys.stdout); sys.exit(1)
    json.dump({"permissionDecision":"allow"},sys.stdout)
except Exception as e:
    _log.log_exc(e); json.dump({"permissionDecision":"allow"},sys.stdout); sys.exit(0)

