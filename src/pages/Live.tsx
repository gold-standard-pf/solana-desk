import { useState } from "react";
import {
  AdviceRail,
  Board,
  Clears,
  LaunchWatches,
  Signals,
  TgCalls,
} from "../components/Rails";
import { Decisions } from "../components/Decisions";
import { Header } from "../components/Header";
import { NowThought, Stream } from "../components/Stream";
import { Theses } from "../components/Theses";
import { Wallet } from "../components/Wallet";
import { useDesk } from "../lib/useDesk";
import type { FeedTab } from "../types";

export function Live() {
  const { data, now, error } = useDesk();
  const [tab, setTab] = useState<FeedTab>("LIVE");

  return (
    <div className="shell">
      <Header data={data} now={now} tab={tab} onTab={setTab} />
      {error ? <p className="banner">tape fetch: {error}</p> : null}
      <NowThought items={data.stream} />
      <Theses theses={data.theses} />
      <Decisions decisions={data.decisions} />
      <div className="rails">
        <Clears items={data.clears} />
        <Signals items={data.signals} />
        <Board items={data.board} />
        <LaunchWatches items={data.launchWatch} />
        <AdviceRail items={data.advice} />
        <TgCalls items={data.tgCalls} />
      </div>
      <Stream items={data.stream} tab={tab} />
      <Wallet address={data.wallet} />
    </div>
  );
}
