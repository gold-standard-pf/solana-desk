import { formatTime } from "../lib/format";
import type { Decision } from "../types";

export function Decisions({ decisions }: { decisions: Decision[] }) {
  const rows = [...decisions].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <section className="block">
      <h2>how it decided</h2>
      {rows.length === 0 ? (
        <p className="empty rail-empty">no calls yet.</p>
      ) : (
        <ul className="calls compact-calls">
          {rows.map((d, i) => (
            <li key={`${d.ticker}-${d.at}-${i}`}>
              <div className="call-head">
                <span className="ticker">${d.ticker}</span>
                <span className={`verdict v-${d.verdict}`}>{d.verdict}</span>
                <time dateTime={d.at}>{formatTime(d.at)}</time>
                {d.sample ? <span className="sample-tag">sample</span> : null}
              </div>
              <ul className="reasons">
                {(d.reasons ?? []).slice(0, 2).map((r, j) => (
                  <li key={j}>{r}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
