import { formatTime } from "../lib/format";
import { useDesk } from "../lib/useDesk";
import { Wallet } from "../components/Wallet";

export function Proof() {
  const { data, error } = useDesk();
  const decisions = [...data.decisions].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const chainFills = [...(data.fills ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const tapeFills = [...data.stream]
    .filter((s) => s.kind === "DID" || s.kind === "REFUSED")
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const live = data.status === "live";

  return (
    <div className="shell">
      <header className="mast compact">
        <div className="mast-top">
          <div className="wordmark">
            <span className="wordmark-name">{data.name || "desk"}</span>
            <span className="wordmark-tag">proof · decision log beside fills</span>
          </div>
          <div className="mast-right">
            <nav className="mast-links">
              <a href="/">TERMINAL</a>
              <a href="/proof">PROOF</a>
            </nav>
            <div className={`pill ${live ? "pill-live" : "pill-idle"}`}>
              <i />
              {live ? "LIVE" : "IDLE"}
            </div>
          </div>
        </div>
      </header>
      {error ? <p className="banner">tape fetch: {error}</p> : null}

      <div className="proof-grid">
        <section className="block">
          <h2>decision log</h2>
          {decisions.length === 0 ? (
            <p className="empty rail-empty">no decisions filed.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>time</th>
                    <th>ticker</th>
                    <th>verdict</th>
                    <th>why</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d, i) => (
                    <tr key={`${d.at}-${i}`}>
                      <td>
                        <time dateTime={d.at}>{formatTime(d.at)}</time>
                      </td>
                      <td className="ticker">${d.ticker}</td>
                      <td>
                        <span className={`verdict v-${d.verdict}`}>{d.verdict}</span>
                        {d.sample ? <span className="sample-tag">sample</span> : null}
                      </td>
                      <td>{(d.reasons ?? []).join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="block">
          <h2>fills</h2>
          <p className="hint">
            {chainFills.length
              ? "fills from the book address."
              : "no on-chain fills yet. DID/REFUSED tape is the stand-in."}
          </p>
          {chainFills.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>time</th>
                    <th>side</th>
                    <th>ticker</th>
                    <th>usd</th>
                    <th>sig</th>
                  </tr>
                </thead>
                <tbody>
                  {chainFills.map((f, i) => (
                    <tr key={`${f.signature}-${i}`}>
                      <td>
                        <time dateTime={f.at}>{formatTime(f.at)}</time>
                      </td>
                      <td>{f.side}</td>
                      <td className="ticker">${f.ticker}</td>
                      <td>{f.usd}</td>
                      <td>
                        <a
                          href={`https://solscan.io/tx/${f.signature}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {f.signature.slice(0, 8)}…
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tapeFills.length === 0 ? (
            <p className="empty">no action ticks.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>time</th>
                    <th>kind</th>
                    <th>note</th>
                  </tr>
                </thead>
                <tbody>
                  {tapeFills.map((s, i) => (
                    <tr key={`${s.at}-${i}`}>
                      <td>
                        <time dateTime={s.at}>{formatTime(s.at)}</time>
                      </td>
                      <td>
                        <span className={`kind k-${s.kind}`}>{s.kind}</span>
                      </td>
                      <td>
                        {s.text}
                        {s.sample ? <span className="sample-tag">sample</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Wallet address={data.wallet} />
    </div>
  );
}
