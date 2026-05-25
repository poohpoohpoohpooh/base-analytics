import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  isAddress,
  parseEther,
  type Hex,
  type Address
} from "viem";
import { base, mainnet } from "viem/chains";
import { normalize, toCoinType } from "viem/ens";
import { getActivityScore, getRankFromScore } from "@/lib/rank";
import type {
  AnalyzeResponse,
  Badge,
  RecentTransaction,
  TopContract,
  WalletMetrics
} from "@/lib/types";

type EtherscanListResponse<T> = {
  status: string;
  message: string;
  result: T[] | string;
};

type NormalTransaction = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  contractAddress?: string;
  isError?: string;
  txreceipt_status?: string;
  methodId?: string;
  functionName?: string;
};

type InternalTransaction = {
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
  isError?: string;
};

type TokenTransfer = {
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenID?: string;
  tokenValue?: string;
};

type ExplorerApiConfig = {
  apiKey: string;
  apiUrl: string;
  includeChainId: boolean;
};

type AlchemyTransferCategory =
  | "external"
  | "erc20"
  | "erc721"
  | "erc1155";

type AlchemyTransfer = {
  blockNum: string;
  uniqueId?: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | string | null;
  asset: string | null;
  category: AlchemyTransferCategory;
  metadata?: {
    blockTimestamp?: string;
  };
  rawContract?: {
    value?: string | null;
    address?: string | null;
    decimal?: string | null;
  };
};

type AlchemyAssetTransfersResult = {
  transfers: AlchemyTransfer[];
  pageKey?: string;
};

type AlchemyNftsForOwnerResponse = {
  ownedNfts?: unknown[];
  pageKey?: string;
};

type AlchemyJsonRpcResponse<T> = {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

type AlchemyTransactionRecord = {
  hash: Hex;
  from: string | null;
  to: string | null;
  timestamp: number | null;
  blockNumber: number | null;
  outgoing: boolean;
  incoming: boolean;
  valueWei: bigint;
  categories: Set<AlchemyTransferCategory>;
};

const BASE_CHAIN_ID = "8453";
const BASE_EXPLORER_URL = "https://basescan.org";
const DAY_MS = 24 * 60 * 60 * 1000;
const ALCHEMY_TRANSFER_CATEGORIES: AlchemyTransferCategory[] = [
  "external",
  "erc20",
  "erc721",
  "erc1155"
];
const EMPTY_INPUTS = new Set(["", "0x", "deprecated"]);
const SWAP_METHOD_IDS = new Set([
  "0x38ed1739",
  "0x7ff36ab5",
  "0x18cbafe5",
  "0x8803dbee",
  "0x5c11d795",
  "0x414bf389",
  "0xc04b8d59",
  "0xdb3e2198",
  "0xf28c0498"
]);
const KNOWN_BASE_SWAP_ROUTERS = new Set(
  [
    "0x2626664c2603336e57b271c5c0b26f421741e481",
    "0x6ff5693b99212da76ad316178a184ab56d299b43",
    "0xcf77a3ba9a5ca399b7c97c74d54e5bf3dc460e43",
    "0x327df1e6de05895d2ab08513aaade4e6a33d928a"
  ].map((address) => address.toLowerCase())
);

const BASE_DEFI_CONTRACTS = new Map(
  [
    ["0x2626664c2603336e57b271c5c0b26f421741e481", "Uniswap Swap Router"],
    ["0x6ff5693b99212da76ad316178a184ab56d299b43", "Uniswap Universal Router"],
    ["0x000000000022d473030f116ddee9f6b43ac78ba3", "Permit2"],
    ["0xcf77a3ba9a5ca399b7c97c74d54e5bf3dc460e43", "Aerodrome Router"],
    ["0x327df1e6de05895d2ab08513aaade4e6a33d928a", "BaseSwap Router"]
  ].map(([address, name]) => [address.toLowerCase(), name])
);

const baseClient = createPublicClient({
  chain: base,
  transport: http(getBaseRpcUrl())
});

const ethereumClient = createPublicClient({
  chain: mainnet,
  transport: process.env.ETHEREUM_RPC_URL
    ? http(process.env.ETHEREUM_RPC_URL)
    : http()
});

export async function analyzeWallet(input: string): Promise<AnalyzeResponse> {
  const trimmedInput = input.trim();
  const { address, basename } = await resolveBaseIdentity(trimmedInput);

  if (hasAlchemyApiConfig()) {
    try {
      return await analyzeWalletWithAlchemy(trimmedInput, address, basename);
    } catch (error) {
      if (!hasExplorerApiConfig()) {
        throw error;
      }
    }
  }

  return analyzeWalletWithExplorer(trimmedInput, address, basename);
}

async function analyzeWalletWithAlchemy(
  trimmedInput: string,
  address: Address,
  basename: string | null
): Promise<AnalyzeResponse> {
  const pageSize = clampEnvNumber("ALCHEMY_PAGE_SIZE", 1000, 1, 1000);
  const maxPages = clampEnvNumber("ALCHEMY_MAX_PAGES", 10, 1, 25);
  const balanceWei = await baseClient.getBalance({ address });
  const [outgoingTransfers, incomingTransfers] = await Promise.all([
    fetchAlchemyTransferPages(address, "from", pageSize, maxPages),
    fetchAlchemyTransferPages(address, "to", pageSize, maxPages)
  ]);
  const transfers = dedupeAlchemyTransfers([
    ...outgoingTransfers,
    ...incomingTransfers
  ]);
  const records = buildAlchemyTransactionRecords(address, transfers);
  const tokenSwaps = estimateAlchemyTokenSwaps(address, transfers);
  const defiInteractions = estimateAlchemyDefiInteractions(address, transfers, records);
  const [contractUsage, recentTransactions, nftsHeld] = await Promise.all([
    buildAlchemyContractUsage(address, records),
    buildAlchemyRecentTransactions(address, records),
    fetchAlchemyNftsHeldSafely(address)
  ]);
  const metrics = buildAlchemyMetrics({
    address,
    balanceWei,
    transfers,
    records,
    contractTransactionHashes: contractUsage.contractTransactionHashes,
    uniqueContractAddresses: contractUsage.uniqueContractAddresses,
    tokenSwaps,
    defiInteractions,
    nftsHeld
  });
  const badge = calculateBadge(metrics);

  return {
    input: trimmedInput,
    address,
    basename,
    generatedAt: new Date().toISOString(),
    metrics,
    badge,
    topContracts: contractUsage.topContracts,
    recentTransactions,
    limits: {
      source: "alchemy",
      pageSize,
      maxPages,
      alchemyTransfersFetched: transfers.length,
      normalTransactionsFetched: records.length,
      internalTransactionsFetched: 0,
      erc20TransfersFetched: transfers.filter((tx) => tx.category === "erc20")
        .length,
      nftTransfersFetched: transfers.filter(
        (tx) => tx.category === "erc721" || tx.category === "erc1155"
      ).length
    }
  };
}

async function analyzeWalletWithExplorer(
  trimmedInput: string,
  address: Address,
  basename: string | null
): Promise<AnalyzeResponse> {
  const explorerApi = getExplorerApiConfig();

  const pageSize = clampEnvNumber("ETHERSCAN_PAGE_SIZE", 1000, 1, 10000);
  const maxPages = clampEnvNumber("ETHERSCAN_MAX_PAGES", 10, 1, 25);

  const balanceWei = await baseClient.getBalance({ address });
  const normalTransactions = await fetchExplorerPages<NormalTransaction>(
    "txlist",
    address,
    explorerApi,
    pageSize,
    maxPages
  );
  const internalTransactions = await fetchExplorerPages<InternalTransaction>(
    "txlistinternal",
    address,
    explorerApi,
    pageSize,
    maxPages
  );
  const erc20Transfers = await fetchExplorerPages<TokenTransfer>(
    "tokentx",
    address,
    explorerApi,
    pageSize,
    maxPages
  );
  const erc721Transfers = await fetchExplorerPages<TokenTransfer>(
    "tokennfttx",
    address,
    explorerApi,
    pageSize,
    maxPages
  );
  const erc1155Transfers = await fetchExplorerPages<TokenTransfer>(
    "token1155tx",
    address,
    explorerApi,
    pageSize,
    maxPages
  );

  const nftTransfers = [...erc721Transfers, ...erc1155Transfers];
  const metrics = buildMetrics({
    address,
    balanceWei,
    normalTransactions,
    internalTransactions,
    erc20Transfers,
    erc721Transfers,
    erc1155Transfers
  });
  const badge = calculateBadge(metrics);
  const topContracts = buildTopContracts(address, normalTransactions);
  const recentTransactions = buildRecentTransactions(address, normalTransactions);

  return {
    input: trimmedInput,
    address,
    basename,
    generatedAt: new Date().toISOString(),
    metrics,
    badge,
    topContracts,
    recentTransactions,
    limits: {
      source: "etherscan",
      pageSize,
      maxPages,
      normalTransactionsFetched: normalTransactions.length,
      internalTransactionsFetched: internalTransactions.length,
      erc20TransfersFetched: erc20Transfers.length,
      nftTransfersFetched: nftTransfers.length
    }
  };
}

async function resolveBaseIdentity(
  input: string
): Promise<{ address: Address; basename: string | null }> {
  if (!input) {
    throw new Error("Enter a Base address or Basename.");
  }

  if (isAddress(input)) {
    return { address: getAddress(input), basename: null };
  }

  if (!input.toLowerCase().endsWith(".base.eth")) {
    throw new Error("Input must be a 0x address or a .base.eth Basename.");
  }

  const name = normalize(input);
  const resolved = await ethereumClient.getEnsAddress({
    name,
    coinType: toCoinType(base.id)
  });

  if (!resolved) {
    throw new Error("Basename could not be resolved on Base Mainnet.");
  }

  return { address: getAddress(resolved), basename: name };
}

async function fetchExplorerPages<T>(
  action: string,
  address: Address,
  explorerApi: ExplorerApiConfig,
  pageSize: number,
  maxPages: number
): Promise<T[]> {
  const rows: T[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const pageRows = await fetchExplorerPage<T>(
      action,
      address,
      explorerApi,
      page,
      pageSize
    );
    rows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }

    await sleep(220);
  }

  return rows;
}

async function fetchExplorerPage<T>(
  action: string,
  address: Address,
  explorerApi: ExplorerApiConfig,
  page: number,
  pageSize: number
): Promise<T[]> {
  const url = new URL(explorerApi.apiUrl);

  if (explorerApi.includeChainId) {
    url.searchParams.set("chainid", BASE_CHAIN_ID);
  }
  url.searchParams.set("module", "account");
  url.searchParams.set("action", action);
  url.searchParams.set("address", address);
  url.searchParams.set("startblock", "0");
  url.searchParams.set("endblock", "999999999");
  url.searchParams.set("page", String(page));
  url.searchParams.set("offset", String(pageSize));
  url.searchParams.set("sort", "asc");
  url.searchParams.set("apikey", explorerApi.apiKey);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Explorer request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as EtherscanListResponse<T>;

  if (payload.status !== "1") {
    const message = String(payload.result || payload.message || "");
    const noRows =
      message.toLowerCase().includes("no transactions") ||
      message.toLowerCase().includes("no records");

    if (noRows) {
      return [];
    }

    throw new Error(message || "Explorer API returned an error.");
  }

  return Array.isArray(payload.result) ? payload.result : [];
}

function getExplorerApiConfig(): ExplorerApiConfig {
  const apiKey = process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY;

  if (apiKey) {
    return {
      apiKey,
      apiUrl: process.env.ETHERSCAN_API_URL || "https://api.etherscan.io/v2/api",
      includeChainId: true
    };
  }

  throw new Error("BASESCAN_API_KEY or ETHERSCAN_API_KEY is required for Etherscan API V2.");
}

async function fetchAlchemyTransferPages(
  address: Address,
  direction: "from" | "to",
  pageSize: number,
  maxPages: number
): Promise<AlchemyTransfer[]> {
  const transfers: AlchemyTransfer[] = [];
  let pageKey: string | undefined;

  for (let page = 1; page <= maxPages; page += 1) {
    const params: Record<string, unknown> = {
      fromBlock: "0x0",
      toBlock: "latest",
      category: ALCHEMY_TRANSFER_CATEGORIES,
      withMetadata: true,
      excludeZeroValue: false,
      maxCount: numberToHex(pageSize),
      order: "asc"
    };

    if (direction === "from") {
      params.fromAddress = address;
    } else {
      params.toAddress = address;
    }

    if (pageKey) {
      params.pageKey = pageKey;
    }

    const result = await callAlchemyRpc<AlchemyAssetTransfersResult>(
      "alchemy_getAssetTransfers",
      [params]
    );

    transfers.push(...result.transfers);

    if (!result.pageKey) {
      break;
    }

    pageKey = result.pageKey;
    await sleep(220);
  }

  return transfers;
}

async function callAlchemyRpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(getAlchemyRpcUrl(), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`Alchemy request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as AlchemyJsonRpcResponse<T>;

  if (payload.error) {
    throw new Error(payload.error.message || "Alchemy RPC returned an error.");
  }

  if (payload.result === undefined) {
    throw new Error("Alchemy RPC returned no result.");
  }

  return payload.result;
}

async function fetchAlchemyNftsHeldSafely(address: Address): Promise<number | null> {
  try {
    return await fetchAlchemyNftsHeld(address);
  } catch (error) {
    console.warn(
      "Unable to fetch Alchemy NFTs held.",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function fetchAlchemyNftsHeld(address: Address): Promise<number> {
  const apiKey = process.env.ALCHEMY_API_KEY?.trim();

  if (!apiKey) {
    return 0;
  }

  const pageSize = clampEnvNumber("ALCHEMY_NFT_PAGE_SIZE", 100, 1, 100);
  const maxPages = clampEnvNumber("ALCHEMY_NFT_MAX_PAGES", 10, 1, 25);
  let pageKey: string | undefined;
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(
      `https://base-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`
    );

    url.searchParams.set("owner", address);
    url.searchParams.set("withMetadata", "false");
    url.searchParams.set("pageSize", String(pageSize));

    if (pageKey) {
      url.searchParams.set("pageKey", pageKey);
    }

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Alchemy NFT request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as AlchemyNftsForOwnerResponse;
    const ownedNfts = Array.isArray(payload.ownedNfts) ? payload.ownedNfts : [];

    total += ownedNfts.length;

    if (!payload.pageKey) {
      break;
    }

    pageKey = payload.pageKey;
    await sleep(220);
  }

  return total;
}

function dedupeAlchemyTransfers(transfers: AlchemyTransfer[]): AlchemyTransfer[] {
  const uniqueTransfers = new Map<string, AlchemyTransfer>();

  for (const transfer of transfers) {
    const key =
      transfer.uniqueId ||
      [
        transfer.hash,
        transfer.category,
        transfer.from,
        transfer.to,
        transfer.rawContract?.address,
        transfer.rawContract?.value,
        transfer.value
      ].join(":");

    if (!uniqueTransfers.has(key)) {
      uniqueTransfers.set(key, transfer);
    }
  }

  return [...uniqueTransfers.values()];
}

function buildAlchemyTransactionRecords(
  address: Address,
  transfers: AlchemyTransfer[]
): AlchemyTransactionRecord[] {
  const lowerAddress = address.toLowerCase();
  const records = new Map<Hex, AlchemyTransactionRecord>();

  for (const transfer of transfers) {
    if (!isHash(transfer.hash)) {
      continue;
    }

    const hash = transfer.hash as Hex;
    const from = transfer.from || null;
    const to = transfer.to || null;
    const timestamp = parseAlchemyTimestamp(transfer);
    const blockNumber = parseHexNumber(transfer.blockNum);
    const outgoing = Boolean(from && from.toLowerCase() === lowerAddress);
    const incoming = Boolean(to && to.toLowerCase() === lowerAddress);
    const current = records.get(hash);

    if (!current) {
      records.set(hash, {
        hash,
        from,
        to,
        timestamp,
        blockNumber,
        outgoing,
        incoming,
        valueWei: parseAlchemyEthValueWei(transfer),
        categories: new Set([transfer.category])
      });
      continue;
    }

    current.outgoing = current.outgoing || outgoing;
    current.incoming = current.incoming || incoming;
    current.valueWei += parseAlchemyEthValueWei(transfer);
    current.categories.add(transfer.category);

    if (!current.timestamp && timestamp) {
      current.timestamp = timestamp;
    }
    if (!current.blockNumber && blockNumber) {
      current.blockNumber = blockNumber;
    }
    if (transfer.category === "external" || !current.from) {
      current.from = from || current.from;
      current.to = to || current.to;
    }
  }

  return [...records.values()].sort(compareAlchemyRecordsAsc);
}

function buildAlchemyMetrics(input: {
  address: Address;
  balanceWei: bigint;
  transfers: AlchemyTransfer[];
  records: AlchemyTransactionRecord[];
  contractTransactionHashes: Set<string>;
  uniqueContractAddresses: Set<string>;
  tokenSwaps: number | null;
  defiInteractions: number | null;
  nftsHeld: number | null;
}): WalletMetrics {
  const {
    address,
    balanceWei,
    transfers,
    records,
    contractTransactionHashes,
    uniqueContractAddresses,
    tokenSwaps,
    defiInteractions,
    nftsHeld
  } = input;
  const timestamps = records
    .map((record) => record.timestamp)
    .filter((timestamp): timestamp is number => timestamp !== null);
  const firstTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : null;
  const lastTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;
  const activeDayKeys = new Set(timestamps.map(toUtcDateKey));
  const activeWeekKeys = new Set(timestamps.map(toUtcWeekKey));
  const activeMonthKeys = new Set(timestamps.map(toUtcMonthKey));
  const { currentStreak, longestStreak } = calculateStreaks([...activeDayKeys]);
  const daysOnBase = firstTimestamp
    ? Math.max(1, differenceInUtcDays(new Date(firstTimestamp * 1000), new Date()) + 1)
    : null;
  const erc20Transfers = transfers.filter((tx) => tx.category === "erc20");
  const nftTransfers = transfers.filter(
    (tx) => tx.category === "erc721" || tx.category === "erc1155"
  );
  const uniqueTokens = new Set(
    erc20Transfers
      .map((tx) => tx.rawContract?.address?.toLowerCase())
      .filter((tokenAddress): tokenAddress is string => Boolean(tokenAddress))
  );
  const sentWei = sumAlchemyEthTransfers(address, transfers, "from");
  const receivedWei = sumAlchemyEthTransfers(address, transfers, "to");

  return {
    ethBalance: formatEthAmount(balanceWei),
    firstTransactionAt: firstTimestamp ? toIsoString(firstTimestamp) : null,
    lastTransactionAt: lastTimestamp ? toIsoString(lastTimestamp) : null,
    daysOnBase,
    activeDays: activeDayKeys.size,
    activeWeeks: activeWeekKeys.size,
    activeMonths: activeMonthKeys.size,
    currentStreak,
    longestStreak,
    totalTransactions: records.length,
    avgTxPerDay:
      daysOnBase && daysOnBase > 0
        ? formatDecimal(records.length / daysOnBase, 2)
        : null,
    contractTransactions: contractTransactionHashes.size,
    uniqueContracts: uniqueContractAddresses.size,
    erc20Transactions: erc20Transfers.length,
    tokenSwaps,
    defiInteractions,
    uniqueTokens: uniqueTokens.size,
    ethVolumeSent: formatEthAmount(sentWei),
    ethReceived: formatEthAmount(receivedWei),
    nftTransactions: nftTransfers.length,
    nftsHeld,
    mostActiveMonth: mostFrequent(timestamps.map(toUtcMonthKey)),
    mostActiveDay: mostFrequent(timestamps.map(toUtcDateKey))
  };
}

async function buildAlchemyContractUsage(
  address: Address,
  records: AlchemyTransactionRecord[]
): Promise<{
  contractTransactionHashes: Set<string>;
  uniqueContractAddresses: Set<string>;
  topContracts: TopContract[];
}> {
  const outgoingRecords = records.filter(
    (record) =>
      record.outgoing &&
      record.to &&
      isAddress(record.to) &&
      !isSameAddress(record.to, address)
  );
  const candidateAddresses = [
    ...new Set(outgoingRecords.map((record) => getAddress(record.to as Address)))
  ];
  const contractAddressMap = new Map<string, boolean>();
  const checks = await mapWithConcurrency(candidateAddresses, 8, async (candidate) => ({
    address: candidate,
    isContract: await isContractAddress(candidate)
  }));

  for (const check of checks) {
    contractAddressMap.set(check.address.toLowerCase(), check.isContract);
  }

  const contractTransactionHashes = new Set<string>();
  const contractStats = new Map<
    string,
    { count: number; lastUsedAt: string | null; sampleFunction: string | null }
  >();

  for (const record of outgoingRecords) {
    const to = record.to ? getAddress(record.to as Address) : null;

    if (!to || !contractAddressMap.get(to.toLowerCase())) {
      continue;
    }

    contractTransactionHashes.add(record.hash);
    const key = to.toLowerCase();
    const timestamp = record.timestamp ? toIsoString(record.timestamp) : null;
    const current = contractStats.get(key);

    if (!current) {
      contractStats.set(key, {
        count: 1,
        lastUsedAt: timestamp,
        sampleFunction: "Contract call"
      });
      continue;
    }

    current.count += 1;
    if (timestamp && (!current.lastUsedAt || timestamp > current.lastUsedAt)) {
      current.lastUsedAt = timestamp;
    }
  }

  const uniqueContractAddresses = new Set(contractStats.keys());
  const topContracts = [...contractStats.entries()]
    .map(([contractAddress, value]) => ({
      address: getAddress(contractAddress),
      count: value.count,
      lastUsedAt: value.lastUsedAt,
      sampleFunction: value.sampleFunction
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    contractTransactionHashes,
    uniqueContractAddresses,
    topContracts
  };
}

async function buildAlchemyRecentTransactions(
  address: Address,
  records: AlchemyTransactionRecord[]
): Promise<RecentTransaction[]> {
  const recentRecords = [...records].sort(compareAlchemyRecordsDesc).slice(0, 10);

  return mapWithConcurrency(recentRecords, 5, async (record) => {
    try {
      const [transaction, receipt] = await Promise.all([
        baseClient.getTransaction({ hash: record.hash }),
        baseClient.getTransactionReceipt({ hash: record.hash })
      ]);
      const fromUser = isSameAddress(transaction.from, address);
      const toUser = transaction.to ? isSameAddress(transaction.to, address) : false;
      const direction = fromUser && toUser ? "Self" : fromUser ? "Out" : "In";
      const counterparty = fromUser ? transaction.to || null : transaction.from;
      const method =
        transaction.input && transaction.input !== "0x"
          ? transaction.input.slice(0, 10)
          : "Transfer";

      return {
        hash: record.hash,
        timestamp: record.timestamp ? toIsoString(record.timestamp) : null,
        direction,
        counterparty,
        valueEth: formatEthAmount(transaction.value),
        method,
        status: receipt.status === "success" ? "Success" : "Failed",
        explorerUrl: `${BASE_EXPLORER_URL}/tx/${record.hash}`
      };
    } catch {
      const direction =
        record.outgoing && record.incoming ? "Self" : record.outgoing ? "Out" : "In";
      const counterparty = record.outgoing ? record.to : record.from;

      return {
        hash: record.hash,
        timestamp: record.timestamp ? toIsoString(record.timestamp) : null,
        direction,
        counterparty,
        valueEth: formatEthAmount(record.valueWei),
        method: "Transfer",
        status: "Unknown",
        explorerUrl: `${BASE_EXPLORER_URL}/tx/${record.hash}`
      };
    }
  });
}

async function isContractAddress(address: Address): Promise<boolean> {
  try {
    const bytecode = await baseClient.getBytecode({ address });
    return Boolean(bytecode && bytecode !== "0x");
  } catch {
    return false;
  }
}

function buildMetrics(input: {
  address: Address;
  balanceWei: bigint;
  normalTransactions: NormalTransaction[];
  internalTransactions: InternalTransaction[];
  erc20Transfers: TokenTransfer[];
  erc721Transfers: TokenTransfer[];
  erc1155Transfers: TokenTransfer[];
}): WalletMetrics {
  const {
    address,
    balanceWei,
    normalTransactions,
    internalTransactions,
    erc20Transfers,
    erc721Transfers,
    erc1155Transfers
  } = input;
  const lowerAddress = address.toLowerCase();
  const userTransactions = normalTransactions.filter((tx) =>
    isSameAddress(tx.from, address)
  );
  const activityTimestamps = [
    ...normalTransactions.map((tx) => parseTimestamp(tx.timeStamp)),
    ...erc20Transfers.map((tx) => parseTimestamp(tx.timeStamp)),
    ...erc721Transfers.map((tx) => parseTimestamp(tx.timeStamp)),
    ...erc1155Transfers.map((tx) => parseTimestamp(tx.timeStamp))
  ].filter((timestamp): timestamp is number => timestamp !== null);

  const firstTimestamp =
    activityTimestamps.length > 0 ? Math.min(...activityTimestamps) : null;
  const lastTimestamp =
    activityTimestamps.length > 0 ? Math.max(...activityTimestamps) : null;
  const activeDayKeys = new Set(activityTimestamps.map(toUtcDateKey));
  const activeWeekKeys = new Set(activityTimestamps.map(toUtcWeekKey));
  const activeMonthKeys = new Set(activityTimestamps.map(toUtcMonthKey));
  const { currentStreak, longestStreak } = calculateStreaks([...activeDayKeys]);
  const contractTransactions = userTransactions.filter(isContractInteraction);
  const uniqueContracts = new Set(
    contractTransactions.map(contractAddressFromTransaction).filter(Boolean)
  );
  const uniqueTokens = new Set(
    erc20Transfers.map((tx) => tx.contractAddress.toLowerCase())
  );
  const sentWei =
    sumWei(
      normalTransactions
        .filter((tx) => isSameAddress(tx.from, address))
        .map((tx) => tx.value)
    ) +
    sumWei(
      internalTransactions
        .filter((tx) => isSameAddress(tx.from, address))
        .map((tx) => tx.value)
    );
  const receivedWei =
    sumWei(
      normalTransactions
        .filter((tx) => isSameAddress(tx.to, address))
        .map((tx) => tx.value)
    ) +
    sumWei(
      internalTransactions
        .filter((tx) => isSameAddress(tx.to, address))
        .map((tx) => tx.value)
    );
  const daysOnBase = firstTimestamp
    ? Math.max(1, differenceInUtcDays(new Date(firstTimestamp * 1000), new Date()) + 1)
    : null;
  const totalTransactions = normalTransactions.length;
  const mostActiveMonth = mostFrequent([...activityTimestamps].map(toUtcMonthKey));
  const mostActiveDay = mostFrequent([...activityTimestamps].map(toUtcDateKey));
  const nftTransactions = erc721Transfers.length + erc1155Transfers.length;

  return {
    ethBalance: formatEthAmount(balanceWei),
    firstTransactionAt: firstTimestamp ? toIsoString(firstTimestamp) : null,
    lastTransactionAt: lastTimestamp ? toIsoString(lastTimestamp) : null,
    daysOnBase,
    activeDays: activeDayKeys.size,
    activeWeeks: activeWeekKeys.size,
    activeMonths: activeMonthKeys.size,
    currentStreak,
    longestStreak,
    totalTransactions,
    avgTxPerDay:
      daysOnBase && daysOnBase > 0
        ? formatDecimal(totalTransactions / daysOnBase, 2)
        : null,
    contractTransactions: contractTransactions.length,
    uniqueContracts: uniqueContracts.size,
    erc20Transactions: erc20Transfers.length,
    tokenSwaps: countTokenSwaps(userTransactions),
    defiInteractions: countDefiInteractions(userTransactions),
    uniqueTokens: uniqueTokens.size,
    ethVolumeSent: formatEthAmount(sentWei),
    ethReceived: formatEthAmount(receivedWei),
    nftTransactions,
    nftsHeld: estimateNftsHeld(lowerAddress, erc721Transfers, erc1155Transfers),
    mostActiveMonth,
    mostActiveDay
  };
}

function buildTopContracts(
  address: Address,
  normalTransactions: NormalTransaction[]
): TopContract[] {
  const contracts = new Map<
    string,
    { count: number; lastUsedAt: string | null; sampleFunction: string | null }
  >();

  for (const tx of normalTransactions) {
    if (!isSameAddress(tx.from, address) || !isContractInteraction(tx)) {
      continue;
    }

    const contractAddress = contractAddressFromTransaction(tx);

    if (!contractAddress) {
      continue;
    }

    const key = contractAddress.toLowerCase();
    const timestamp = parseTimestamp(tx.timeStamp);
    const current = contracts.get(key);
    const txIso = timestamp ? toIsoString(timestamp) : null;

    if (!current) {
      contracts.set(key, {
        count: 1,
        lastUsedAt: txIso,
        sampleFunction: cleanMethodName(tx.functionName, tx.methodId)
      });
      continue;
    }

    current.count += 1;
    if (txIso && (!current.lastUsedAt || txIso > current.lastUsedAt)) {
      current.lastUsedAt = txIso;
    }
    if (!current.sampleFunction) {
      current.sampleFunction = cleanMethodName(tx.functionName, tx.methodId);
    }
  }

  return [...contracts.entries()]
    .map(([contractAddress, value]) => ({
      address: getAddress(contractAddress),
      count: value.count,
      lastUsedAt: value.lastUsedAt,
      sampleFunction: value.sampleFunction
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildRecentTransactions(
  address: Address,
  normalTransactions: NormalTransaction[]
): RecentTransaction[] {
  return [...normalTransactions]
    .sort((a, b) => Number(b.timeStamp || 0) - Number(a.timeStamp || 0))
    .slice(0, 10)
    .map((tx) => {
      const fromUser = isSameAddress(tx.from, address);
      const toUser = isSameAddress(tx.to, address);
      const direction = fromUser && toUser ? "Self" : fromUser ? "Out" : "In";
      const counterparty = fromUser ? tx.to || null : tx.from || null;
      const timestamp = parseTimestamp(tx.timeStamp);

      return {
        hash: tx.hash,
        timestamp: timestamp ? toIsoString(timestamp) : null,
        direction,
        counterparty,
        valueEth: formatEthAmount(parseWei(tx.value)),
        method: cleanMethodName(tx.functionName, tx.methodId) || "Transfer",
        status: getTransactionStatus(tx),
        explorerUrl: `${BASE_EXPLORER_URL}/tx/${tx.hash}`
      };
    });
}

function calculateBadge(metrics: WalletMetrics): Badge {
  const score = getActivityScore({
    ...metrics,
    defiInteractions: metrics.defiInteractions
  });
  const rank = getRankFromScore(score, metrics);

  return { score, label: rank, rank };
}

function estimateNftsHeld(
  lowerAddress: string,
  erc721Transfers: TokenTransfer[],
  erc1155Transfers: TokenTransfer[]
): number | null {
  const erc721Holdings = new Set<string>();
  const erc1155Holdings = new Map<string, bigint>();

  for (const tx of [...erc721Transfers].sort(sortByTimestampAsc)) {
    const key = `${tx.contractAddress.toLowerCase()}:${tx.tokenID || tx.hash}`;

    if (tx.to.toLowerCase() === lowerAddress) {
      erc721Holdings.add(key);
    }
    if (tx.from.toLowerCase() === lowerAddress) {
      erc721Holdings.delete(key);
    }
  }

  for (const tx of [...erc1155Transfers].sort(sortByTimestampAsc)) {
    const key = `${tx.contractAddress.toLowerCase()}:${tx.tokenID || tx.hash}`;
    const amount = parseWei(tx.tokenValue || "1");
    const current = erc1155Holdings.get(key) || 0n;

    if (tx.to.toLowerCase() === lowerAddress) {
      erc1155Holdings.set(key, current + amount);
    }
    if (tx.from.toLowerCase() === lowerAddress) {
      erc1155Holdings.set(key, current - amount);
    }
  }

  if (erc721Transfers.length === 0 && erc1155Transfers.length === 0) {
    return 0;
  }

  return (
    erc721Holdings.size +
    [...erc1155Holdings.values()].filter((balance) => balance > 0n).length
  );
}

function countTokenSwaps(transactions: NormalTransaction[]): number {
  return transactions.filter((tx) => {
    const method = `${tx.functionName || ""} ${tx.methodId || ""}`.toLowerCase();
    const methodId = tx.methodId?.toLowerCase();
    const to = tx.to.toLowerCase();
    const isKnownRouter = KNOWN_BASE_SWAP_ROUTERS.has(to);
    const hasSwapName =
      method.includes("swap") ||
      method.includes("exactinput") ||
      method.includes("exactoutput");
    const hasSwapSelector = Boolean(methodId && SWAP_METHOD_IDS.has(methodId));
    const routerExecution =
      isKnownRouter &&
      (method.includes("execute") || method.includes("multicall") || hasSwapSelector);

    return hasSwapName || hasSwapSelector || routerExecution;
  }).length;
}

function estimateAlchemyTokenSwaps(
  address: Address,
  transfers: AlchemyTransfer[]
): number {
  const lowerAddress = address.toLowerCase();
  const groupedTransfers = new Map<
    string,
    { incomingTokens: Set<string>; outgoingTokens: Set<string> }
  >();

  for (const transfer of transfers) {
    if (transfer.category !== "erc20" || !isHash(transfer.hash)) {
      continue;
    }

    const tokenKey = getAlchemyTokenKey(transfer);

    if (!tokenKey) {
      continue;
    }

    const fromUser = transfer.from?.toLowerCase() === lowerAddress;
    const toUser = transfer.to?.toLowerCase() === lowerAddress;

    if (!fromUser && !toUser) {
      continue;
    }

    const current =
      groupedTransfers.get(transfer.hash) ||
      { incomingTokens: new Set<string>(), outgoingTokens: new Set<string>() };

    if (fromUser) {
      current.outgoingTokens.add(tokenKey);
    }
    if (toUser) {
      current.incomingTokens.add(tokenKey);
    }

    groupedTransfers.set(transfer.hash, current);
  }

  let swaps = 0;

  for (const transferSet of groupedTransfers.values()) {
    if (
      transferSet.outgoingTokens.size > 0 &&
      transferSet.incomingTokens.size > 0 &&
      hasDifferentTokenPair(transferSet.outgoingTokens, transferSet.incomingTokens)
    ) {
      swaps += 1;
    }
  }

  return swaps;
}

function estimateAlchemyDefiInteractions(
  address: Address,
  transfers: AlchemyTransfer[],
  records: AlchemyTransactionRecord[]
): number | null {
  if (BASE_DEFI_CONTRACTS.size === 0) {
    return null;
  }

  const defiTransactionHashes = new Set<string>();

  for (const record of records) {
    if (
      record.outgoing &&
      record.to &&
      BASE_DEFI_CONTRACTS.has(record.to.toLowerCase())
    ) {
      defiTransactionHashes.add(record.hash);
    }
  }

  for (const transfer of transfers) {
    if (!isHash(transfer.hash) || !isUserTransfer(address, transfer)) {
      continue;
    }

    const from = transfer.from?.toLowerCase();
    const to = transfer.to?.toLowerCase();

    if (
      (from && BASE_DEFI_CONTRACTS.has(from)) ||
      (to && BASE_DEFI_CONTRACTS.has(to))
    ) {
      defiTransactionHashes.add(transfer.hash);
    }
  }

  return defiTransactionHashes.size;
}

function countDefiInteractions(transactions: NormalTransaction[]): number | null {
  if (BASE_DEFI_CONTRACTS.size === 0) {
    return null;
  }

  return transactions.filter((tx) =>
    BASE_DEFI_CONTRACTS.has((tx.to || tx.contractAddress || "").toLowerCase())
  ).length;
}

function getAlchemyTokenKey(transfer: AlchemyTransfer): string | null {
  return (
    transfer.rawContract?.address?.toLowerCase() ||
    transfer.asset?.toLowerCase() ||
    null
  );
}

function hasDifferentTokenPair(
  outgoingTokens: Set<string>,
  incomingTokens: Set<string>
): boolean {
  for (const outgoingToken of outgoingTokens) {
    for (const incomingToken of incomingTokens) {
      if (outgoingToken !== incomingToken) {
        return true;
      }
    }
  }

  return false;
}

function isUserTransfer(address: Address, transfer: AlchemyTransfer): boolean {
  return isSameAddress(transfer.from, address) || isSameAddress(transfer.to || undefined, address);
}

function isContractInteraction(tx: NormalTransaction): boolean {
  return Boolean(
    tx.contractAddress ||
      (tx.to && !EMPTY_INPUTS.has((tx.input || "").toLowerCase()))
  );
}

function contractAddressFromTransaction(tx: NormalTransaction): string | null {
  return tx.contractAddress || tx.to || null;
}

function isSameAddress(value: string | undefined, address: Address): boolean {
  return Boolean(value && value.toLowerCase() === address.toLowerCase());
}

function parseTimestamp(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toIsoString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

function toUtcDateKey(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function toUtcMonthKey(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 7);
}

function toUtcWeekKey(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);

  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function calculateStreaks(dayKeys: string[]): {
  currentStreak: number | null;
  longestStreak: number | null;
} {
  if (dayKeys.length === 0) {
    return { currentStreak: null, longestStreak: null };
  }

  const sorted = [...new Set(dayKeys)].sort();
  let longest = 1;
  let run = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00.000Z`);
    const current = new Date(`${sorted[index]}T00:00:00.000Z`);

    if (differenceInUtcDays(previous, current) === 1) {
      run += 1;
    } else {
      run = 1;
    }

    longest = Math.max(longest, run);
  }

  let currentStreak = 1;
  for (let index = sorted.length - 1; index > 0; index -= 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00.000Z`);
    const current = new Date(`${sorted[index]}T00:00:00.000Z`);

    if (differenceInUtcDays(previous, current) === 1) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak: longest };
}

function differenceInUtcDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  return Math.floor((endUtc - startUtc) / DAY_MS);
}

function mostFrequent(values: string[]): string | null {
  if (values.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

function sumWei(values: string[]): bigint {
  return values.reduce((sum, value) => sum + parseWei(value), 0n);
}

function parseWei(value: string | undefined): bigint {
  try {
    return BigInt(value || "0");
  } catch {
    return 0n;
  }
}

function formatEthAmount(wei: bigint): string {
  const raw = formatEther(wei);
  const [whole, fraction = ""] = raw.split(".");
  const decimals = whole === "0" ? 6 : 4;
  const trimmedFraction = fraction.slice(0, decimals).replace(/0+$/, "");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return trimmedFraction ? `${formattedWhole}.${trimmedFraction}` : formattedWhole;
}

function parseFormattedNumber(value: string | null): number {
  const parsed = Number((value || "0").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDecimal(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: value > 0 && value < 1 ? decimals : 0
  });
}

function cleanMethodName(
  functionName: string | undefined,
  methodId: string | undefined
): string | null {
  if (functionName && functionName.trim()) {
    return functionName.replace(/\s+/g, " ").trim();
  }

  return methodId && methodId !== "0x" ? methodId : null;
}

function getTransactionStatus(
  tx: NormalTransaction
): RecentTransaction["status"] {
  if (tx.isError === "1" || tx.txreceipt_status === "0") {
    return "Failed";
  }
  if (tx.isError === "0" || tx.txreceipt_status === "1") {
    return "Success";
  }
  return "Unknown";
}

function sortByTimestampAsc(a: TokenTransfer, b: TokenTransfer): number {
  return Number(a.timeStamp || 0) - Number(b.timeStamp || 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampEnvNumber(
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? Math.round(clamp(parsed, min, max)) : fallback;
}

function hasAlchemyApiConfig(): boolean {
  return Boolean(process.env.ALCHEMY_API_KEY?.trim());
}

function hasExplorerApiConfig(): boolean {
  return Boolean(
    process.env.BASESCAN_API_KEY?.trim() || process.env.ETHERSCAN_API_KEY?.trim()
  );
}

function getBaseRpcUrl(): string {
  if (hasAlchemyApiConfig()) {
    return getAlchemyRpcUrl();
  }

  return process.env.BASE_RPC_URL || "https://mainnet.base.org";
}

function getAlchemyRpcUrl(): string {
  const apiKey = process.env.ALCHEMY_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is required for Alchemy RPC.");
  }

  return `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
}

function numberToHex(value: number): Hex {
  return `0x${value.toString(16)}`;
}

function isHash(value: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

function parseAlchemyTimestamp(transfer: AlchemyTransfer): number | null {
  const timestamp = transfer.metadata?.blockTimestamp;

  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : null;
}

function parseHexNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAlchemyEthValueWei(transfer: AlchemyTransfer): bigint {
  const isNativeEth =
    transfer.category === "external" && (transfer.asset || "ETH").toUpperCase() === "ETH";

  if (!isNativeEth) {
    return 0n;
  }

  const rawValue = transfer.rawContract?.value;

  if (rawValue) {
    try {
      return rawValue.startsWith("0x") ? BigInt(rawValue) : BigInt(rawValue);
    } catch {
      return 0n;
    }
  }

  if (transfer.value === null || transfer.value === undefined) {
    return 0n;
  }

  try {
    return parseEther(String(transfer.value));
  } catch {
    return 0n;
  }
}

function sumAlchemyEthTransfers(
  address: Address,
  transfers: AlchemyTransfer[],
  direction: "from" | "to"
): bigint {
  return transfers.reduce((sum, transfer) => {
    const endpoint = direction === "from" ? transfer.from : transfer.to || undefined;

    if (!isSameAddress(endpoint, address)) {
      return sum;
    }

    return sum + parseAlchemyEthValueWei(transfer);
  }, 0n);
}

function compareAlchemyRecordsAsc(
  first: AlchemyTransactionRecord,
  second: AlchemyTransactionRecord
): number {
  return (
    (first.timestamp || 0) - (second.timestamp || 0) ||
    (first.blockNumber || 0) - (second.blockNumber || 0)
  );
}

function compareAlchemyRecordsDesc(
  first: AlchemyTransactionRecord,
  second: AlchemyTransactionRecord
): number {
  return (
    (second.timestamp || 0) - (first.timestamp || 0) ||
    (second.blockNumber || 0) - (first.blockNumber || 0)
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(concurrency, 1), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    })
  );

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
