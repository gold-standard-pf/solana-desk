const chicagoClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = n < 0 ? "-" : "";
  return `${sign}$${abs}`;
}

export function formatSignedMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return `+$${abs}`;
  if (n < 0) return `-$${abs}`;
  return `$${abs}`;
}

export function formatPct(n: number): string {
  const body = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return `+${body}%`;
  if (n < 0) return `-${body}%`;
  return `${body}%`;
}

export function pnlClass(n: number): string {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  return chicagoClock.format(d);
}

export function formatAwake(startedAt: string, nowMs: number): string {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "—";
  const ms = Math.max(0, nowMs - start);
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}D ${hours}H`;
  if (hours > 0) return `${hours}H ${mins}M`;
  const secs = Math.floor((ms / 1000) % 60);
  if (mins > 0) return `${mins}M ${secs}S`;
  return `${secs}S`;
}

export function solscanUrl(wallet: string): string | null {
  if (!wallet || wallet === "pending-wallet") return null;
  return `https://solscan.io/account/${wallet}`;
}
