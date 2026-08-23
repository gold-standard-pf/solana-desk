import { formatMoney, formatPct, formatSignedMoney, pnlClass } from "../lib/format";
import type { Thesis } from "../types";

export function Theses({ theses }: { theses: Thesis[] }) {
  return (
    <section className="block">
      <h2>open books</h2>
      {theses.length === 0 ? (
        <p className="empty rail-empty">no open books. cash is idle.</p>
      ) : (
        <div className="books">
          {theses.map((t, i) => (
            <article key={`${t.ticker}-${i}`} className="book">
              <header>
                <span className="ticker">${t.ticker}</span>
                {t.sample ? <span className="sample-tag">sample</span> : null}
              </header>
              <div className="book-value">{formatMoney(t.valueUsd)}</div>
              <div className="book-marks">
                <div>
                  <span className="k">invested</span>
                  <span className="v">{formatMoney(t.investedUsd)}</span>
                </div>
                <div>
                  <span className="k">p&l</span>
                  <span className={`v ${pnlClass(t.pnlUsd)}`}>
                    {formatSignedMoney(t.pnlUsd)} {formatPct(t.pnlPct)}
                  </span>
                </div>
              </div>
              <p className="thesis">{t.thesis}</p>
              {t.invalidation ? (
                <p className="inval">invalidation · {t.invalidation}</p>
              ) : (
                <p className="inval mute">no invalidation — do not size</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
