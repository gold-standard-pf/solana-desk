import type { ReactNode } from "react";
import { formatMoney, formatTime } from "../lib/format";
import type { Advice, BoardItem, Clear, LaunchWatch, Signal, TgCall } from "../types";

function Rail({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: ReactNode;
}) {
  if (count === 0) {
    return (
      <section className="rail rail-collapsed">
        <h2>{title}</h2>
        <p className="empty">{empty}</p>
      </section>
    );
  }
  return (
    <section className="rail">
      <h2>
        {title} <span className="count">{count}</span>
      </h2>
      {children}
    </section>
  );
}

export function Signals({ items }: { items: Signal[] }) {
  const rows = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <Rail title="signals" empty="empty" count={rows.length}>
      <ul className="calls compact-calls">
        {rows.map((s, i) => (
          <li key={`${s.name}-${s.at}-${i}`}>
            <div className="call-head">
              <span className="ticker">{s.name}</span>
              <span className={`verdict v-${s.verdict.toLowerCase()}`}>{s.verdict}</span>
              <span className="muted">heat {s.heat}</span>
              <span className="muted">{s.source}</span>
              <time dateTime={s.at}>{formatTime(s.at)}</time>
            </div>
            <p className="thesis">{s.thesis}</p>
            <p className="hint">{s.mint || "no mint"}</p>
          </li>
        ))}
      </ul>
    </Rail>
  );
}

export function Board({ items }: { items: BoardItem[] }) {
  const rows = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <Rail title="board" empty="empty" count={rows.length}>
      <ul className="calls compact-calls">
        {rows.map((b, i) => (
          <li key={`${b.mint}-${b.at}-${i}`}>
            <div className="call-head">
              <span className="ticker">${b.ticker}</span>
              <span className={`verdict v-${b.verdict.toLowerCase()}`}>{b.verdict}</span>
              <time dateTime={b.at}>{formatTime(b.at)}</time>
            </div>
            <p className="hint">
              {b.ageMin}m · liq {formatMoney(b.dexLiqUsd)} · {b.socials}
              {b.boost ? ` · boost ${b.boost === true ? "yes" : b.boost}` : ""}
              {b.inverted ? " · inverted" : ""}
            </p>
            <p className="thesis">{b.note}</p>
          </li>
        ))}
      </ul>
    </Rail>
  );
}

export function LaunchWatches({ items }: { items: LaunchWatch[] }) {
  return (
    <Rail title="launch watch" empty="empty" count={items.length}>
      <ul className="calls compact-calls">
        {items.map((w, i) => (
          <li key={`${w.name}-${i}`}>
            <div className="call-head">
              <span className="ticker">{w.name}</span>
              <span className={`verdict v-${w.status}`}>{w.status}</span>
            </div>
            <p className="hint">
              {w.mint || "mint unbound"} · {(w.sources || []).join(", ")}
              {w.boundAt ? ` · bound ${formatTime(w.boundAt)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </Rail>
  );
}

export function Clears({ items }: { items: Clear[] }) {
  const rows = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <Rail title="mint clears" empty="empty" count={rows.length}>
      <ul className="calls compact-calls">
        {rows.map((c, i) => (
          <li key={`${c.mint}-${c.at}-${i}`}>
            <div className="call-head">
              <span className="ticker">${c.ticker}</span>
              <span className={`verdict v-${c.verdict.toLowerCase()}`}>{c.verdict}</span>
              <time dateTime={c.at}>{formatTime(c.at)}</time>
            </div>
            <ul className="reasons">
              <li>
                lp burned {c.lpBurned == null ? "?" : c.lpBurned ? "yes" : "no"} · freeze{" "}
                {c.freezeAuth || "none"} · mint auth {c.mintAuth || "none"} · top10{" "}
                {c.top10Pct ?? "?"}% · age {c.ageHours ?? "?"}h
              </li>
              {(c.reasons ?? []).map((r, j) => (
                <li key={j}>{r}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Rail>
  );
}

export function AdviceRail({ items }: { items: Advice[] }) {
  const rows = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <Rail title="wallet advice" empty="empty" count={rows.length}>
      <ul className="calls compact-calls">
        {rows.map((a, i) => (
          <li key={`${a.mint}-${a.at}-${i}`}>
            <div className="call-head">
              <span className="ticker">${a.ticker}</span>
              <span className={`verdict v-${a.call}`}>{a.call}</span>
              <span className="muted">{formatMoney(a.markUsd)}</span>
              <time dateTime={a.at}>{formatTime(a.at)}</time>
            </div>
            <p className="thesis">{a.note}</p>
            <p className="hint">vs invalidation: {a.vsInvalidation}</p>
          </li>
        ))}
      </ul>
    </Rail>
  );
}

export function TgCalls({ items }: { items: TgCall[] }) {
  const rows = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <Rail title="tg calls" empty="empty" count={rows.length}>
      <ul className="calls compact-calls">
        {rows.map((t, i) => (
          <li key={`${t.messageId}-${t.at}-${i}`}>
            <div className="call-head">
              <span className="ticker">{t.from || "tg"}</span>
              <span className="muted">{t.chat}</span>
              <time dateTime={t.at}>{formatTime(t.at)}</time>
            </div>
            <p className="thesis">{t.text}</p>
          </li>
        ))}
      </ul>
    </Rail>
  );
}
