#!/usr/bin/env python3
"""Lock-file stamp for /workspace/desk/public/desk.json. Concurrent-safe."""
from __future__ import annotations

import argparse
import fcntl
import json
import os
import sys
import tempfile
from datetime import datetime, timezone

PATH = "/workspace/desk/public/desk.json"
LOCK = PATH + ".lock"
ARRAYS = ("signals", "decisions", "stream", "advice", "clears", "board", "tgCalls")
KINDS = ("READ", "DID", "REFUSED")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def locked_mutate(fn):
    os.makedirs(os.path.dirname(PATH), exist_ok=True)
    with open(LOCK, "a+") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        try:
            if os.path.exists(PATH):
                with open(PATH) as f:
                    data = json.load(f)
            else:
                data = {}
            fn(data)
            dirn = os.path.dirname(PATH)
            fd, tmp = tempfile.mkstemp(dir=dirn, suffix=".tmp")
            try:
                with os.fdopen(fd, "w") as f:
                    json.dump(data, f, indent=2)
                    f.write("\n")
                os.replace(tmp, PATH)
            except Exception:
                try:
                    os.unlink(tmp)
                except OSError:
                    pass
                raise
        finally:
            fcntl.flock(lf, fcntl.LOCK_UN)


def parse_json(raw: str | None) -> dict:
    if not raw:
        return {}
    obj = json.loads(raw)
    if not isinstance(obj, dict):
        raise SystemExit("--json must be a JSON object")
    return obj


def main() -> int:
    p = argparse.ArgumentParser(description="Stamp desk.json under a lock.")
    p.add_argument("--kind", choices=KINDS, help="stream kind (default READ if writing stream)")
    p.add_argument("--text", default="", help="stream/call text")
    p.add_argument("--mint", default="")
    p.add_argument("--ticker", default="")
    p.add_argument("--array", choices=ARRAYS, default="stream")
    p.add_argument("--json", dest="blob", default="", help="JSON object merged into the row")
    args = p.parse_args()
    extra = parse_json(args.blob or None)

    def apply(data: dict) -> None:
        arr = args.array
        data.setdefault(arr, [])
        if not isinstance(data[arr], list):
            data[arr] = []
        row = dict(extra)
        row.setdefault("at", utc_now())
        if args.mint:
            row["mint"] = args.mint
        if args.ticker:
            row["ticker"] = args.ticker
        if arr == "stream":
            row["kind"] = args.kind or row.get("kind") or "READ"
            if args.text or "text" not in row:
                row["text"] = args.text or row.get("text") or ""
        elif args.text:
            if arr == "tgCalls":
                row.setdefault("text", args.text)
            elif arr == "advice":
                row.setdefault("note", args.text)
            elif arr in ("signals", "board"):
                row.setdefault("thesis" if arr == "signals" else "note", args.text)
            elif arr == "decisions":
                row.setdefault("reasons", [args.text])
            elif arr == "clears":
                row.setdefault("reasons", [args.text])
        if arr == "tgCalls":
            row.setdefault("chat", extra.get("chat", ""))
            row.setdefault("from", extra.get("from", ""))
            row.setdefault("messageId", extra.get("messageId", 0))
        data[arr].insert(0, row)

    locked_mutate(apply)
    print("ok", args.array, args.kind or "-", args.ticker or args.mint or "")
    return 0


if __name__ == "__main__":
    sys.exit(main())
