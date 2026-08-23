#!/usr/bin/env python3
"""Pump watcher tape writer. Only mutates board[] and launchWatch[]. Never fills/theses/DID."""
import json, sys, os, tempfile
from datetime import datetime, timezone

PATH = "/workspace/desk/public/desk.json"

def load():
    with open(PATH) as f:
        return json.load(f)

def save(data):
    dirn = os.path.dirname(PATH)
    fd, tmp = tempfile.mkstemp(dir=dirn, suffix=".tmp")
    with os.fdopen(fd, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    os.replace(tmp, PATH)

def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

def stamp_board(mint, ticker, age_min, dex_liq_usd, socials, boost, inverted, verdict, note):
    data = load()
    data.setdefault("board", [])
    # newest first; skip exact mint+verdict dup in last 3
    for row in data["board"][:3]:
        if row.get("mint") == mint and row.get("verdict") == verdict:
            print("skip_dup", mint, verdict)
            return
    row = {
        "at": now(),
        "mint": mint,
        "ticker": ticker,
        "ageMin": age_min,
        "dexLiqUsd": dex_liq_usd,
        "socials": socials,
        "boost": boost,
        "inverted": inverted,
        "verdict": verdict,
        "note": note,
    }
    data["board"].insert(0, row)
    save(data)
    print("board_ok", ticker, mint, verdict)

def bind_watch(name, mint):
    data = load()
    data.setdefault("launchWatch", [])
    bound = 0
    for row in data["launchWatch"]:
        if row.get("status") == "watching" and row.get("name", "").lower() == name.lower():
            row["mint"] = mint
            row["boundAt"] = now()
            row["status"] = "bound"
            bound += 1
    if bound:
        save(data)
    print("bound", bound, name, mint)

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "board":
        # board MINT TICKER AGE_MIN DEX_LIQ SOCIALS BOOST INVERTED VERDICT NOTE
        _, _, mint, ticker, age, liq, socials, boost, inverted, verdict = sys.argv[:10]
        note = " ".join(sys.argv[10:]) if len(sys.argv) > 10 else ""
        stamp_board(mint, ticker, float(age), float(liq), socials, boost, inverted.lower() == "true", verdict, note)
    elif cmd == "bind":
        bind_watch(sys.argv[2], sys.argv[3])
    else:
        print("usage: pump_tape.py board|bind ...")
        sys.exit(1)
