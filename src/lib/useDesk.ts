import { useEffect, useState } from "react";
import { EMPTY_DESK, type DeskState } from "../types";

const POLL_MS = 3000;

export function useDesk() {
  const [data, setData] = useState<DeskState>(EMPTY_DESK);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}desk.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`desk.json ${res.status}`);
        const json = (await res.json()) as DeskState;
        if (cancelled) return;
        setData({
          ...EMPTY_DESK,
          ...json,
          theses: json.theses ?? [],
          decisions: json.decisions ?? [],
          stream: json.stream ?? [],
          signals: json.signals ?? [],
          board: json.board ?? [],
          launchWatch: json.launchWatch ?? [],
          clears: json.clears ?? [],
          advice: json.advice ?? [],
          fills: json.fills ?? [],
          tgCalls: json.tgCalls ?? [],
        });
        setError(null);
        setUpdatedAt(Date.now());
        setNow(Date.now());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "fetch failed");
        }
      }
    }

    void pull();
    const poll = window.setInterval(() => void pull(), POLL_MS);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  return { data, now, error, updatedAt };
}
