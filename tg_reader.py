#!/usr/bin/env python3
"""Poll GrokSquad getUpdates. Stamp tgCalls. Promote Terry Calls + TokenScan to signals."""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/workspace/desk")
TOKEN_PATH = ROOT / ".secrets" / "telegram.token"
OFFSET_PATH = ROOT / ".secrets" / "tg_offset"
CHAT_PATH = ROOT / ".secrets" / "tg_chat_id"
TAPE = ROOT / "public" / "desk.json"

MINT_RE = re.compile(r"\b([1-9A-HJ-NP-Za-km-z]{32,44})\b")
TICKER_RE = re.compile(r"\$([A-Za-z0-9]{2,16})\b")
NOISE_CMD = re.compile(r"^/(lb|start|help|settings|menu|stats)\b", re.I)


def api(token: str, method: str, params: dict | None = None) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def iso(ts: int | None) -> str:
    if ts:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def blob_of(msg: dict, who: str) -> str:
    parts = [who]
    for key in ("forward_from", "via_bot"):
        obj = msg.get(key) or {}
        parts.append(obj.get("username") or "")
        parts.append(obj.get("first_name") or "")
    for key in ("forward_from_chat", "sender_chat"):
        obj = msg.get(key) or {}
        parts.append(obj.get("title") or "")
        parts.append(obj.get("username") or "")
    origin = msg.get("forward_origin") or {}
    chat = origin.get("chat") or {}
    parts.append(chat.get("title") or "")
    parts.append(chat.get("username") or "")
    sender = origin.get("sender_user") or {}
    parts.append(sender.get("username") or "")
    parts.append(sender.get("first_name") or "")
    return " ".join(p for p in parts if p).lower()


def classify(msg: dict, who: str, text: str) -> str:
    b = blob_of(msg, who)
    if "terry" in b or "terry" in text.lower():
        return "terry"
    if "tokenscan" in b or "@tokenscan" in text.lower() or who.lower() in {"tokenscan", "tokenscanbot"}:
        return "tokenscan"
    return "other"


def extract_mint(text: str) -> str:
    best = ""
    for m in MINT_RE.findall(text or ""):
        if m.endswith("pump") or (32 <= len(m) <= 44 and not m.isdigit()):
            if m.endswith("pump") or len(m) >= 40:
                return m
            if len(m) > len(best):
                best = m
    return best


def extract_ticker(text: str) -> str:
    m = TICKER_RE.search(text or "")
    if m:
        return m.group(1)
    return ""


def promote(tape: dict, rec: dict) -> None:
    mint = rec.get("mint") or ""
    ticker = rec.get("ticker") or rec.get("name") or "UNKNOWN"
    name = ticker if ticker.startswith("$") else f"${ticker}" if ticker != "UNKNOWN" else rec.get("from", "terry")
    sigs = tape.setdefault("signals", [])
    key = (mint, rec.get("messageId"))
    if any((s.get("mint"), s.get("tgMessageId")) == key for s in sigs):
        return
    sigs.insert(
        0,
        {
            "at": rec["at"],
            "name": name,
            "thesis": rec.get("text", "")[:500],
            "heat": "terry-calls",
            "mint": mint,
            "source": "terry-calls",
            "verdict": "PASS",
            "tgMessageId": rec.get("messageId"),
        },
    )
    tape["signals"] = sigs[:200]
    if not mint:
        watches = tape.setdefault("launchWatch", [])
        if not any(w.get("name") == name and w.get("status") == "watching" for w in watches):
            watches.insert(
                0,
                {
                    "name": name,
                    "sources": ["terry-calls", "telegram:Pump it"],
                    "mint": "",
                    "boundAt": "",
                    "status": "watching",
                },
            )
            tape["launchWatch"] = watches[:100]


def main() -> None:
    token = TOKEN_PATH.read_text().strip()
    offset = 0
    if OFFSET_PATH.exists():
        try:
            offset = int(OFFSET_PATH.read_text().strip() or "0")
        except ValueError:
            offset = 0
    data = api(token, "getUpdates", {"offset": offset, "timeout": 0})
    if not data.get("ok"):
        print("tg error", data)
        return
    updates = data.get("result") or []
    tape = json.loads(TAPE.read_text())
    calls = tape.setdefault("tgCalls", [])
    existing = {(c.get("chatId"), c.get("messageId")) for c in calls}
    added = 0
    promoted = 0
    max_id = offset
    for u in updates:
        max_id = max(max_id, int(u.get("update_id", 0)) + 1)
        msg = u.get("message") or u.get("channel_post") or {}
        text = (msg.get("text") or msg.get("caption") or "").strip()
        if not text:
            continue
        chat = (msg.get("chat") or {}).get("title") or str((msg.get("chat") or {}).get("id") or "")
        chat_id = (msg.get("chat") or {}).get("id")
        if CHAT_PATH.exists():
            allow = CHAT_PATH.read_text().strip()
            if allow and str(chat_id) != allow:
                continue
        mid = msg.get("message_id")
        if (chat_id, mid) in existing:
            continue
        frm = msg.get("from") or {}
        who = frm.get("username") or frm.get("first_name") or "unknown"
        kind = classify(msg, who, text)
        mint = extract_mint(text)
        ticker = extract_ticker(text)
        rec = {
            "at": iso(msg.get("date")),
            "chat": chat,
            "chatId": chat_id,
            "from": who,
            "kind": kind,
            "ticker": ticker,
            "mint": mint,
            "text": text[:2000],
            "messageId": mid,
        }
        calls.insert(0, rec)
        existing.add((chat_id, mid))
        added += 1
        noise = bool(NOISE_CMD.search(text)) and not mint
        if kind in {"terry", "tokenscan"} and not noise:
            promote(tape, rec)
            promoted += 1

    tape["tgCalls"] = calls[:300]
    if added:
        stream = tape.setdefault("stream", [])
        extra = f" Promoted {promoted} Terry/TokenScan name(s) to signals." if promoted else ""
        stream.insert(
            0,
            {
                "at": iso(None),
                "kind": "READ",
                "text": f"READ {added} telegram message(s) in Pump it.{extra} Names only. Not a fill.",
            },
        )
        tape["stream"] = stream[:200]
        tape["ticks"] = len(tape["stream"])
        TAPE.write_text(json.dumps(tape, indent=2) + "\n")
    elif promoted:
        TAPE.write_text(json.dumps(tape, indent=2) + "\n")
    if updates:
        OFFSET_PATH.write_text(str(max_id) + "\n")
    print(f"updates={len(updates)} added={added} promoted={promoted} next_offset={max_id or offset}")


if __name__ == "__main__":
    main()
