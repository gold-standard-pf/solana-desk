# desk.json contract

Single source of truth. UI GETs `/desk.json` every 3s.
Path: `/workspace/desk/public/desk.json`
Wallet: `5WFKW7qqqFa8Kw366aDnmGz2LvVDhZWGbH7nNnzo99Hp`

## who writes what
- @OMO: theses (must include `invalidation`), decisions (pass/hold/refuse), DID only after the book prints the fill, REFUSED
- @Solana Genius: `clears` (CLEAR/FAIL), READ ticks
- @Signal Monitor: `signals` only (never fills)
- @Pump watcher: `board` and bind `launchWatch` mints (never fills)
- @Wallet Watcher: `advice` only (cut/hold/take). Never DID. Never a send.

## root
`name, status (live|idle), model, startedAt, ticks, equityUsd, spentUsd, realizedPnlUsd, unrealizedPnlUsd, wallet`
arrays: `theses, decisions, stream, signals, board, launchWatch, clears, advice, fills, tgCalls`

## objects
Thesis: `{ ticker, mint, valueUsd, pnlUsd, pnlPct, investedUsd, thesis, invalidation, sample? }`
- `invalidation` is required before size. @Wallet Watcher scores the fill against this line.

Decision (OMO): `{ ticker, mint?, verdict: pass|hold|refuse, at, reasons[] }`

Stream: `{ at, kind: READ|DID|REFUSED, text, mint? }`

Signal (Signal Monitor): `{ at, name, thesis, heat, mint, source, verdict: PASS|REFUSE }`
- `mint` may be `""` if pre-token. Then add a `launchWatch` row.

Board (Pump watcher): `{ at, mint, ticker, ageMin, dexLiqUsd, socials, boost, inverted, verdict: PASS|REFUSE, note }`

Launch watch (Signal opens, Pump binds mint): `{ name, sources[], mint, boundAt, status: watching|bound|dead }`
- When pump.fun prints the ticker, Pump sets `mint` + `status: bound` and pings @Solana Genius.

Clear (Solana Genius): `{ at, mint, ticker, verdict: CLEAR|FAIL, lpBurned, freezeAuth, mintAuth, top10Pct, ageHours, reasons[] }`
- @OMO does not size without a written CLEAR on that mint.

Advice (Wallet Watcher): `{ at, mint, ticker, call: cut|hold|take, vsInvalidation, markUsd, note }`
- Advice is not a send. @OMO reads it before an exit.

Fill (from chain, not from memory): `{ at, signature, side: buy|sell, mint, ticker, usd, tokenAmount }`
- DID is allowed only after a fill row exists with that signature.

Do not write `sample: true` in live. Newest first preferred.

TG calls (GrokSquad bot, Solana Genius reader): `{ at, chat, from, text, messageId }`
- A TG call is a name, not a PASS and not a fill. @Signal Monitor upgrades it if the story clears.
- Token lives in `/workspace/desk/.secrets/telegram.token`. Never put it on the tape.

Terry Calls: messages in Pump it from Terry (or forwarded from Terry Calls) and TokenScan replies (`@tokenscan`, via_bot tokenscan) promote to `signals` with `source: terry-calls` and `verdict: PASS`. Mint extracted when present. No mint opens `launchWatch`. Still not a fill. @Solana Genius CLEARs before @OMO sizes.

## stamp.py (other bots)
`python3 /workspace/desk/stamp.py --kind READ --text "..."`
Optional `--mint` `--ticker` `--array signals|decisions|stream|advice|clears|board|tgCalls`.
`--json '{...}'` merges a JSON object onto the new row (newest first).
Default `--array` is `stream`. `--kind` defaults to READ on stream rows.
Lock: `public/desk.json.lock` via fcntl, then write a sibling `.tmp` and `os.replace`.
Path written: `/workspace/desk/public/desk.json`. Newest row is inserted at index 0.
Do not invent fills or PnL. DID only after a real `fills[]` signature exists.
