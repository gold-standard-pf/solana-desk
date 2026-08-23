export type DeskStatus = "live" | "idle";
export type Verdict = "pass" | "hold" | "refuse";
export type StreamKind = "READ" | "DID" | "REFUSED";
export type FeedTab = "LIVE" | "HISTORY" | "JOURNAL" | "LOG";

export type Thesis = {
  ticker: string;
  mint: string;
  valueUsd: number;
  pnlUsd: number;
  pnlPct: number;
  investedUsd: number;
  thesis: string;
  invalidation?: string;
  sample?: boolean;
};

export type Decision = {
  ticker: string;
  mint?: string;
  verdict: Verdict;
  at: string;
  reasons: string[];
  sample?: boolean;
};

export type StreamItem = {
  at: string;
  kind: StreamKind;
  text: string;
  mint?: string;
  sample?: boolean;
};

export type Signal = {
  at: string;
  name: string;
  thesis: string;
  heat: number | string;
  mint: string;
  source: string;
  verdict: "PASS" | "REFUSE";
};

export type BoardItem = {
  at: string;
  mint: string;
  ticker: string;
  ageMin: number;
  dexLiqUsd: number;
  socials: string;
  boost?: boolean | string;
  inverted?: boolean;
  verdict: "PASS" | "REFUSE";
  note: string;
};

export type LaunchWatch = {
  name: string;
  sources: string[];
  mint: string;
  boundAt: string;
  status: "watching" | "bound" | "dead";
};

export type Clear = {
  at: string;
  mint: string;
  ticker: string;
  verdict: "CLEAR" | "FAIL";
  lpBurned: boolean | null;
  freezeAuth: string;
  mintAuth: string;
  top10Pct: number | null;
  ageHours: number | null;
  reasons: string[];
};

export type Advice = {
  at: string;
  mint: string;
  ticker: string;
  call: "cut" | "hold" | "take";
  vsInvalidation: string;
  markUsd: number;
  note: string;
};

export type Fill = {
  at: string;
  signature: string;
  side: "buy" | "sell";
  mint: string;
  ticker: string;
  usd: number;
  tokenAmount: number;
};

export type TgCall = {
  at: string;
  chat: string;
  from: string;
  text: string;
  messageId: number;
  chatId?: number;
};

export type DeskState = {
  name: string;
  status: DeskStatus;
  model: string;
  startedAt: string;
  ticks: number;
  equityUsd: number;
  spentUsd: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  wallet: string;
  theses: Thesis[];
  decisions: Decision[];
  stream: StreamItem[];
  signals: Signal[];
  board: BoardItem[];
  launchWatch: LaunchWatch[];
  clears: Clear[];
  advice: Advice[];
  fills: Fill[];
  tgCalls: TgCall[];
};

export const EMPTY_DESK: DeskState = {
  name: "desk",
  status: "idle",
  model: "pending",
  startedAt: new Date().toISOString(),
  ticks: 0,
  equityUsd: 0,
  spentUsd: 0,
  realizedPnlUsd: 0,
  unrealizedPnlUsd: 0,
  wallet: "pending-wallet",
  theses: [],
  decisions: [],
  stream: [],
  signals: [],
  board: [],
  launchWatch: [],
  clears: [],
  advice: [],
  fills: [],
  tgCalls: [],
};
