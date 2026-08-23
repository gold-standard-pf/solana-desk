import {
  formatAwake,
  formatMoney,
  formatSignedMoney,
  pnlClass,
} from "../lib/format";
import type { DeskState, FeedTab } from "../types";

type Props = {
  data: DeskState;
  now: number;
  tab: FeedTab;
  onTab: (t: FeedTab) => void;
};

function fomoLabel(data: DeskState): { label: string; value: string } {
  const heats = data.signals
    .map((s) => (typeof s.heat === "number" ? s.heat : Number(s.heat)))
    .filter((n) => Number.isFinite(n));
  if (heats.length) {
    const max = Math.max(...heats);
    return { label: "FOMO / heat", value: String(max) };
  }
  return { label: "signals", value: String(data.signals.length) };
}

export function Header({ data, now, tab, onTab }: Props) {
  const live = data.status === "live";
  const tabs: FeedTab[] = ["LIVE", "HISTORY", "JOURNAL", "LOG"];
  const fomo = fomoLabel(data);

  return (
    <header className="mast">
      <div className="mast-top">
        <div className="wordmark">
          <span className="wordmark-name">{data.name || "desk"}</span>
          <span className="wordmark-tag">public terminal · first-person blotter</span>
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

      <nav className="tabs" aria-label="tape views">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "tab on" : "tab"}
            onClick={() => onTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <dl className="metrics">
        <div>
          <dt>model</dt>
          <dd>{data.model || "pending"}</dd>
        </div>
        <div>
          <dt>awake</dt>
          <dd>{formatAwake(data.startedAt, now)}</dd>
        </div>
        <div>
          <dt>ticks</dt>
          <dd>{data.ticks.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>{fomo.label}</dt>
          <dd>{fomo.value}</dd>
        </div>
        <div>
          <dt>total equity</dt>
          <dd>{formatMoney(data.equityUsd)}</dd>
        </div>
        <div>
          <dt>total spent</dt>
          <dd>{formatMoney(data.spentUsd)}</dd>
        </div>
        <div>
          <dt>realized p&l</dt>
          <dd className={pnlClass(data.realizedPnlUsd)}>
            {formatSignedMoney(data.realizedPnlUsd)}
          </dd>
        </div>
        <div>
          <dt>unrealized p&l</dt>
          <dd className={pnlClass(data.unrealizedPnlUsd)}>
            {formatSignedMoney(data.unrealizedPnlUsd)}
          </dd>
        </div>
      </dl>
    </header>
  );
}
