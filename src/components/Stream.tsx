import { formatTime } from "../lib/format";
import type { FeedTab, StreamItem } from "../types";

function filterFeed(items: StreamItem[], tab: FeedTab): StreamItem[] {
  const sorted = [...items].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  if (tab === "HISTORY") return sorted.filter((i) => i.kind === "DID" || i.kind === "REFUSED");
  if (tab === "JOURNAL") return sorted.filter((i) => i.kind === "READ");
  return sorted;
}

export function Stream({ items, tab }: { items: StreamItem[]; tab: FeedTab }) {
  const rows = filterFeed(items, tab);
  const dense = tab === "LOG";
  const label =
    tab === "HISTORY"
      ? "history · did / refused"
      : tab === "JOURNAL"
        ? "journal · reads"
        : tab === "LOG"
          ? "log · verb tape"
          : "live stream";

  return (
    <section className={`block tape-block ${dense ? "tape-dense" : ""}`}>
      <h2>{label}</h2>
      {rows.length === 0 ? (
        <p className="empty rail-empty">tape is quiet.</p>
      ) : (
        <ol className={`tape ${dense ? "tape-log" : ""}`}>
          {rows.map((s, i) => (
            <li
              key={`${s.at}-${s.kind}-${i}`}
              className={`tick kind-${s.kind} ${s.kind === "REFUSED" ? "tick-refuse" : ""}`}
            >
              <time dateTime={s.at}>{formatTime(s.at)}</time>
              <span className={`kind k-${s.kind}`}>{s.kind}</span>
              <p>
                {s.text}
                {s.sample ? <span className="sample-tag">sample</span> : null}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function NowThought({ items }: { items: StreamItem[] }) {
  const newest = [...items].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )[0];
  return (
    <section className="now">
      <h2>now</h2>
      <p>{newest?.text ?? "waiting on the first tick."}</p>
    </section>
  );
}
