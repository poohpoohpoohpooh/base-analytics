export type WalletMetrics = {
  ethBalance: string | null;
  firstTransactionAt: string | null;
  lastTransactionAt: string | null;
  daysOnBase: number | null;
  activeDays: number;
  activeWeeks: number;
  activeMonths: number;
  currentStreak: number | null;
  longestStreak: number | null;
  totalTransactions: number;
  avgTxPerDay: string | null;
  contractTransactions: number;
  uniqueContracts: number;
  erc20Transactions: number | null;
  tokenSwaps: number | null;
  defiInteractions: number | null;
  uniqueTokens: number | null;
  ethVolumeSent: string | null;
  ethReceived: string | null;
  nftTransactions: number | null;
  nftsHeld: number | null;
  mostActiveMonth: string | null;
  mostActiveDay: string | null;
};

export type Badge = {
  score: number;
  label: string;
  rank: string;
};

export type TopContract = {
  address: string;
  count: number;
  lastUsedAt: string | null;
  sampleFunction: string | null;
};

export type RecentTransaction = {
  hash: string;
  timestamp: string | null;
  direction: "In" | "Out" | "Self";
  counterparty: string | null;
  valueEth: string;
  method: string;
  status: "Success" | "Failed" | "Unknown";
  explorerUrl: string;
};

export type AnalyzeResponse = {
  input: string;
  address: string;
  basename: string | null;
  generatedAt: string;
  metrics: WalletMetrics;
  badge: Badge;
  topContracts: TopContract[];
  recentTransactions: RecentTransaction[];
  limits: {
    source: "alchemy" | "etherscan";
    pageSize: number;
    maxPages: number;
    alchemyTransfersFetched?: number;
    normalTransactionsFetched: number;
    internalTransactionsFetched: number;
    erc20TransfersFetched: number;
    nftTransfersFetched: number;
  };
};
