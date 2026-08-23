import { solscanUrl } from "../lib/format";

export function Wallet({ address }: { address: string }) {
  const href = solscanUrl(address);
  return (
    <footer className="wallet">
      <span className="k">wallet</span>
      <code>{address || "pending-wallet"}</code>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          solscan
        </a>
      ) : (
        <span className="muted">solscan when address lands</span>
      )}
    </footer>
  );
}
