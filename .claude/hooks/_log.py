import os, datetime, traceback
def log(msg: str):
    path = ".claude/logs/hook_errors.log"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a") as f:
        ts = datetime.datetime.now().isoformat(timespec="seconds")
        f.write(f"[{ts}] {msg}\n")
def log_exc(e: Exception):
    log("".join(traceback.format_exception(e)))
