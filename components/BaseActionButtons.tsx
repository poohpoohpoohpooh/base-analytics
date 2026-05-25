"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties
} from "react";
import {
  CalendarCheck,
  Loader2,
  Moon,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  SunMedium
} from "lucide-react";
import {
  decodeFunctionResult,
  encodeFunctionData,
  getAddress,
  type Address,
  type Hash
} from "viem";
import { base, baseSepolia } from "viem/chains";
import {
  type SuccessReaction,
  SuccessReactionOverlay
} from "@/components/SuccessReactionOverlay";
import { baseIdentityActionsAbi } from "@/lib/baseIdentityActionsAbi";
import { pickRandom } from "@/lib/pickRandom";
import {
  getReactionAssets,
  type ReactionKind
} from "@/lib/reactionAssets";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type ActionName = "dailyCheckIn" | "gm" | "gn";
type StatsFunctionName =
  | "lastDailyCheckIn"
  | "lastGM"
  | "lastGN"
  | "totalCheckIns"
  | "totalGMs"
  | "totalGNs";

type ActionStats = {
  lastDailyCheckIn: bigint;
  lastGM: bigint;
  lastGN: bigint;
  totalCheckIns: bigint;
  totalGMs: bigint;
  totalGNs: bigint;
};

type LocalActionState = Record<ActionName, boolean>;

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BASE_IDENTITY_ACTIONS_ADDRESS as Address | undefined;
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);
const EXPECTED_CHAIN = EXPECTED_CHAIN_ID === baseSepolia.id ? baseSepolia : base;
const ZERO_STATS: ActionStats = {
  lastDailyCheckIn: 0n,
  lastGM: 0n,
  lastGN: 0n,
  totalCheckIns: 0n,
  totalGMs: 0n,
  totalGNs: 0n
};
const NO_LOCAL_CONFIRMATIONS: LocalActionState = {
  dailyCheckIn: false,
  gm: false,
  gn: false
};

const actionConfig: Record<
  ActionName,
  {
    label: string;
    icon: typeof CalendarCheck;
    cooldownSeconds: number;
    lastKey: keyof Pick<ActionStats, "lastDailyCheckIn" | "lastGM" | "lastGN">;
    totalKey: keyof Pick<ActionStats, "totalCheckIns" | "totalGMs" | "totalGNs">;
  }
> = {
  dailyCheckIn: {
    label: "Daily Check-in",
    icon: CalendarCheck,
    cooldownSeconds: 24 * 60 * 60,
    lastKey: "lastDailyCheckIn",
    totalKey: "totalCheckIns"
  },
  gm: {
    label: "GM",
    icon: SunMedium,
    cooldownSeconds: 12 * 60 * 60,
    lastKey: "lastGM",
    totalKey: "totalGMs"
  },
  gn: {
    label: "GN",
    icon: Moon,
    cooldownSeconds: 12 * 60 * 60,
    lastKey: "lastGN",
    totalKey: "totalGNs"
  }
};

export function BaseActionButtons() {
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [stats, setStats] = useState<ActionStats>(ZERO_STATS);
  const [pendingAction, setPendingAction] = useState<ActionName | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locallyConfirmed, setLocallyConfirmed] = useState<LocalActionState>(
    NO_LOCAL_CONFIRMATIONS
  );
  const [currentReaction, setCurrentReaction] = useState<SuccessReaction | null>(null);
  const locallyConfirmedRef = useRef<Set<ActionName>>(new Set());
  const lastReactionSrcRef = useRef<string | null>(null);
  const reactionTimersRef = useRef<number[]>([]);

  const provider = getInjectedProvider();
  const isConnected = Boolean(walletAddress);
  const wrongNetwork = Boolean(chainId && chainId !== EXPECTED_CHAIN_ID);
  const contractReady = Boolean(CONTRACT_ADDRESS);

  const refreshWalletState = useCallback(async () => {
    const injectedProvider = getInjectedProvider();

    if (!injectedProvider) {
      return;
    }

    const [accounts, currentChainId] = await Promise.all([
      injectedProvider.request({ method: "eth_accounts" }) as Promise<string[]>,
      injectedProvider.request({ method: "eth_chainId" }) as Promise<string>
    ]);

    setWalletAddress(accounts[0] ? getAddress(accounts[0]) : null);
    setChainId(Number.parseInt(currentChainId, 16));
  }, []);

  const refreshActionState = useCallback(async () => {
    if (!walletAddress || !CONTRACT_ADDRESS || !provider || chainId !== EXPECTED_CHAIN_ID) {
      setStats(ZERO_STATS);
      locallyConfirmedRef.current.clear();
      setLocallyConfirmed(NO_LOCAL_CONFIRMATIONS);
      return;
    }

    try {
      const [
        lastDailyCheckIn,
        lastGM,
        lastGN,
        totalCheckIns,
        totalGMs,
        totalGNs
      ] = await Promise.all([
        readActionStat(provider, "lastDailyCheckIn", walletAddress),
        readActionStat(provider, "lastGM", walletAddress),
        readActionStat(provider, "lastGN", walletAddress),
        readActionStat(provider, "totalCheckIns", walletAddress),
        readActionStat(provider, "totalGMs", walletAddress),
        readActionStat(provider, "totalGNs", walletAddress)
      ]);

      const latestStats: ActionStats = {
        lastDailyCheckIn,
        lastGM,
        lastGN,
        totalCheckIns,
        totalGMs,
        totalGNs
      };
      const synchronizedActions = new Set<ActionName>();

      for (const actionName of locallyConfirmedRef.current) {
        const config = actionConfig[actionName];

        if (
          latestStats[config.totalKey] > 0n &&
          getRemainingCooldown(latestStats[config.lastKey], config.cooldownSeconds) > 0
        ) {
          synchronizedActions.add(actionName);
        }
      }

      setStats((previousStats) => {
        const mergedStats = { ...latestStats };

        for (const actionName of locallyConfirmedRef.current) {
          if (synchronizedActions.has(actionName)) {
            continue;
          }

          const config = actionConfig[actionName];
          mergedStats[config.lastKey] = maxBigInt(
            latestStats[config.lastKey],
            previousStats[config.lastKey]
          );
          mergedStats[config.totalKey] = maxBigInt(
            latestStats[config.totalKey],
            previousStats[config.totalKey]
          );
        }

        return mergedStats;
      });

      if (synchronizedActions.size > 0) {
        synchronizedActions.forEach((actionName) => {
          locallyConfirmedRef.current.delete(actionName);
        });
        setLocallyConfirmed((current) => {
          const next = { ...current };

          synchronizedActions.forEach((actionName) => {
            next[actionName] = false;
          });

          return next;
        });
      }
    } catch (caught) {
      if (locallyConfirmedRef.current.size > 0) {
        setStatus("Transaction confirmed. On-chain counts will sync shortly.");
        return;
      }

      setError(parseWalletError(caught));
    }
  }, [chainId, provider, walletAddress]);

  useEffect(() => {
    void refreshWalletState();

    if (!provider?.on) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccount = Array.isArray(accounts) ? accounts[0] : null;
      setWalletAddress(typeof nextAccount === "string" ? getAddress(nextAccount) : null);
      locallyConfirmedRef.current.clear();
      setLocallyConfirmed(NO_LOCAL_CONFIRMATIONS);
      setStatus(null);
      setError(null);
    };
    const handleChainChanged = (nextChainId: unknown) => {
      setChainId(
        typeof nextChainId === "string" ? Number.parseInt(nextChainId, 16) : null
      );
      locallyConfirmedRef.current.clear();
      setLocallyConfirmed(NO_LOCAL_CONFIRMATIONS);
      setStatus(null);
      setError(null);
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [provider, refreshWalletState]);

  useEffect(() => {
    void refreshActionState();
  }, [refreshActionState]);

  useEffect(() => {
    return () => {
      reactionTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  async function connectWallet() {
    setError(null);
    setStatus(null);

    if (!provider) {
      setError("Wallet not found.");
      return;
    }

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts"
      })) as string[];
      const currentChainId = (await provider.request({
        method: "eth_chainId"
      })) as string;

      setWalletAddress(accounts[0] ? getAddress(accounts[0]) : null);
      setChainId(Number.parseInt(currentChainId, 16));
    } catch (caught) {
      setError(parseWalletError(caught));
    }
  }

  async function switchToExpectedChain() {
    setError(null);
    setStatus(null);

    if (!provider) {
      setError("Wallet not found.");
      return;
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(EXPECTED_CHAIN_ID) }]
      });
      setChainId(EXPECTED_CHAIN_ID);
    } catch (caught) {
      if (isUnknownChainError(caught)) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [buildAddChainParams()]
          });
          setChainId(EXPECTED_CHAIN_ID);
          return;
        } catch (addError) {
          setError(parseWalletError(addError));
          return;
        }
      }

      setError(parseWalletError(caught));
    }
  }

  async function runAction(actionName: ActionName) {
    setError(null);
    setStatus(null);
    setTxHash(null);

    if (!provider) {
      setError("Wallet not found.");
      return;
    }
    if (!walletAddress) {
      setError("Connect wallet first.");
      return;
    }
    if (!CONTRACT_ADDRESS) {
      setError("Contract address missing.");
      return;
    }
    if (wrongNetwork) {
      setError(`Switch to ${EXPECTED_CHAIN.name}.`);
      return;
    }

    setPendingAction(actionName);

    try {
      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: CONTRACT_ADDRESS,
            value: "0x0",
            data: encodeFunctionData({
              abi: baseIdentityActionsAbi,
              functionName: actionName
            })
          }
        ]
      })) as Hash;

      setTxHash(hash);
      setStatus("Transaction submitted.");

      const receipt = await waitForWalletReceipt(provider, hash);

      if (receipt.status !== "0x1") {
        throw new Error("Transaction failed.");
      }

      applyConfirmedAction(actionName);
      setStatus(`${actionConfig[actionName].label} confirmed.`);
      triggerSuccessReaction(actionToReactionKind(actionName));
      await refreshActionState();
    } catch (caught) {
      setError(parseWalletError(caught));
    } finally {
      setPendingAction(null);
    }
  }

  function triggerSuccessReaction(kind: ReactionKind) {
    const src = pickRandom(getReactionAssets(kind), lastReactionSrcRef.current);

    if (!src) {
      return;
    }

    const id = Date.now();

    lastReactionSrcRef.current = src;
    reactionTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });

    setCurrentReaction({
      id,
      kind,
      src,
      phase: "enter",
      visible: true
    });

    const fullTimer = window.setTimeout(() => {
      setCurrentReaction((reaction) =>
        reaction?.id === id ? { ...reaction, phase: "full" } : reaction
      );
    }, 40);
    const miniTimer = window.setTimeout(() => {
      setCurrentReaction((reaction) =>
        reaction?.id === id ? { ...reaction, phase: "mini" } : reaction
      );
    }, 2500);

    reactionTimersRef.current = [fullTimer, miniTimer];
  }

  function applyConfirmedAction(actionName: ActionName) {
    const config = actionConfig[actionName];
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    locallyConfirmedRef.current.add(actionName);
    setLocallyConfirmed((current) => ({
      ...current,
      [actionName]: true
    }));
    setStats((current) => {
      const next = { ...current };

      next[config.lastKey] = timestamp;
      next[config.totalKey] = current[config.totalKey] + 1n;

      return next;
    });
  }

  return (
    <>
      <section
        className="relative overflow-hidden rounded-2xl border border-blue-400/25 bg-slate-950/70 p-6 shadow-[0_0_46px_rgba(37,99,235,0.26)] backdrop-blur-xl"
        style={actionSectionStyle}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-200/75 shadow-[0_0_28px_rgba(125,211,252,0.8)]"
          style={topGlowStyle}
        />
        <div
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          style={headerRowStyle}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80"
              style={eyebrowStyle}
            >
              Onchain Actions
            </p>
            <h2 className="mt-2 text-xl font-bold text-white" style={titleStyle}>
              Daily Check-in / GM / GN
            </h2>
            <p
              className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/70"
              style={descriptionStyle}
            >
              Send a lightweight Base transaction to your identity action contract.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" style={buttonRowStyle}>
            {!isConnected ? (
              <button
                type="button"
                className={primaryButtonClass}
                style={getActionButtonStyle(false)}
                onClick={connectWallet}
              >
                <PlugZap className="size-4" aria-hidden="true" />
                Connect Wallet
              </button>
            ) : wrongNetwork ? (
              <button
                type="button"
                className={primaryButtonClass}
                style={getActionButtonStyle(false)}
                onClick={switchToExpectedChain}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Switch to {EXPECTED_CHAIN.name}
              </button>
            ) : (
              (Object.keys(actionConfig) as ActionName[]).map((actionName) => {
                const config = actionConfig[actionName];
                const Icon = config.icon;
                const remaining = getRemainingCooldown(
                  stats[config.lastKey],
                  config.cooldownSeconds
                );
                const disabled =
                  !contractReady ||
                  pendingAction !== null ||
                  locallyConfirmed[actionName] ||
                  remaining > 0 ||
                  !walletAddress ||
                  wrongNetwork;

                return (
                  <button
                    key={actionName}
                    type="button"
                    className={primaryButtonClass}
                    style={getActionButtonStyle(disabled)}
                    disabled={disabled}
                    onClick={() => void runAction(actionName)}
                    title={remaining > 0 ? `Cooldown: ${formatDuration(remaining)}` : undefined}
                  >
                    {pendingAction === actionName ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                    {remaining > 0
                      ? `${config.label} (${formatDuration(remaining)})`
                      : config.label}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3" style={statsGridStyle}>
          <ActionStat label="Check-ins" value={stats.totalCheckIns} />
          <ActionStat label="GMs" value={stats.totalGMs} />
          <ActionStat label="GNs" value={stats.totalGNs} />
        </div>

        <div
          className="mt-5 flex items-start gap-3 rounded-xl border border-cyan-200/20 bg-blue-950/30 p-4 text-sm text-blue-100/80"
          style={safetyNoticeStyle}
        >
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cyan-200" aria-hidden="true" />
          <div>
            <p style={safetyNoticeLineStyle}>
              This app only sends optional 0 ETH Base transactions for Daily Check-in /
              GM / GN. It never asks for token approvals, NFT approvals, Permit
              signatures, or asset transfers. Always verify the transaction before
              signing.
            </p>
            <p style={{ ...safetyNoticeLineStyle, marginTop: "8px" }}>
              このアプリは Daily Check-in / GM / GN のために、任意の0 ETHトランザクションのみ送信します。
              トークン承認、NFT承認、Permit署名、資産送金は要求しません。
              署名前に必ず内容を確認してください。
            </p>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-blue-100/70"
          style={metaRowStyle}
        >
          <span>{walletAddress ? shortWallet(walletAddress) : "Wallet not connected"}</span>
          <span>Chain: {EXPECTED_CHAIN.name}</span>
          {CONTRACT_ADDRESS ? (
            <span>Contract: {shortWallet(CONTRACT_ADDRESS)}</span>
          ) : (
            <span className="text-amber-200">Set contract address in .env.local</span>
          )}
        </div>

        {txHash ? (
          <p className="mt-3 text-sm font-semibold text-cyan-100" style={txTextStyle}>
            Tx:{" "}
            <a
              className="underline decoration-cyan-200/60 underline-offset-4"
              href={`${EXPECTED_CHAIN.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortWallet(txHash)}
            </a>
          </p>
        ) : null}
        {status ? (
          <p className="mt-3 text-sm font-semibold text-emerald-200" style={successTextStyle}>
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm font-semibold text-rose-200" style={errorTextStyle}>
            {error}
          </p>
        ) : null}
      </section>
      <SuccessReactionOverlay reaction={currentReaction} />
    </>
  );
}

function ActionStat({ label, value }: { label: string; value: bigint }) {
  return (
    <div
      className="rounded-xl border border-blue-400/20 bg-slate-900/60 p-4"
      style={statCardStyle}
    >
      <p
        className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/70"
        style={statLabelStyle}
      >
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white" style={statValueStyle}>
        {value.toString()}
      </p>
    </div>
  );
}

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-100/35 bg-blue-500 px-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.46)] transition hover:-translate-y-0.5 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:border-blue-200/10 disabled:bg-slate-700 disabled:text-blue-100/60 disabled:shadow-none";

const actionSectionStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "24px",
  border: "1px solid rgba(96, 165, 250, 0.25)",
  background: "rgba(2, 6, 23, 0.70)",
  padding: "24px",
  boxShadow: "0 0 46px rgba(37, 99, 235, 0.26)",
  backdropFilter: "blur(18px)",
  color: "#eaf2ff"
};

const topGlowStyle: CSSProperties = {
  pointerEvents: "none",
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: "1px",
  background: "rgba(165, 243, 252, 0.75)",
  boxShadow: "0 0 28px rgba(125, 211, 252, 0.8)"
};

const headerRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px"
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "rgba(165, 243, 252, 0.82)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase"
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 800,
  lineHeight: 1.25
};

const descriptionStyle: CSSProperties = {
  margin: "8px 0 0",
  maxWidth: "42rem",
  color: "rgba(219, 234, 254, 0.72)",
  fontSize: "14px",
  lineHeight: 1.7
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px"
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "12px",
  marginTop: "20px"
};

const statCardStyle: CSSProperties = {
  borderRadius: "16px",
  border: "1px solid rgba(96, 165, 250, 0.20)",
  background: "rgba(15, 23, 42, 0.60)",
  padding: "16px",
  boxShadow:
    "0 0 22px rgba(37, 99, 235, 0.14), inset 0 0 16px rgba(59, 130, 246, 0.08)"
};

const statLabelStyle: CSSProperties = {
  margin: 0,
  color: "rgba(191, 219, 254, 0.72)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase"
};

const statValueStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  lineHeight: 1.15
};

const safetyNoticeStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginTop: "20px",
  borderRadius: "14px",
  border: "1px solid rgba(103, 232, 249, 0.2)",
  background: "rgba(23, 37, 84, 0.28)",
  padding: "14px 16px",
  color: "rgba(219, 234, 254, 0.82)",
  fontSize: "13px",
  lineHeight: 1.65
};

const safetyNoticeLineStyle: CSSProperties = {
  margin: 0
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  marginTop: "16px",
  color: "rgba(219, 234, 254, 0.70)",
  fontSize: "12px",
  fontWeight: 700
};

const txTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#cffafe",
  fontSize: "14px",
  fontWeight: 700
};

const successTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#bbf7d0",
  fontSize: "14px",
  fontWeight: 700
};

const errorTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#fecdd3",
  fontSize: "14px",
  fontWeight: 700
};

function getActionButtonStyle(disabled: boolean): CSSProperties {
  return {
    display: "inline-flex",
    height: "44px",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "12px",
    border: disabled
      ? "1px solid rgba(147, 197, 253, 0.12)"
      : "1px solid rgba(207, 250, 254, 0.35)",
    background: disabled
      ? "#334155"
      : "linear-gradient(90deg, #3b82f6 0%, #22d3ee 100%)",
    color: disabled ? "rgba(219, 234, 254, 0.60)" : "#ffffff",
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: 800,
    boxShadow: disabled ? "none" : "0 0 28px rgba(59, 130, 246, 0.46)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.72 : 1,
    transition: "transform 160ms ease, filter 160ms ease, background 160ms ease"
  };
}

function getInjectedProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as Window & { ethereum?: EthereumProvider }).ethereum || null;
}

function actionToReactionKind(actionName: ActionName): ReactionKind {
  if (actionName === "dailyCheckIn") {
    return "checkin";
  }

  return actionName;
}

async function readActionStat(
  provider: EthereumProvider,
  functionName: StatsFunctionName,
  user: Address
): Promise<bigint> {
  if (!CONTRACT_ADDRESS) {
    return 0n;
  }

  const data = encodeFunctionData({
    abi: baseIdentityActionsAbi,
    functionName,
    args: [user]
  });
  const result = (await provider.request({
    method: "eth_call",
    params: [
      {
        to: CONTRACT_ADDRESS,
        data
      },
      "latest"
    ]
  })) as `0x${string}`;

  return decodeFunctionResult({
    abi: baseIdentityActionsAbi,
    functionName,
    data: result
  }) as bigint;
}

async function waitForWalletReceipt(provider: EthereumProvider, hash: Hash) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const receipt = (await provider.request({
      method: "eth_getTransactionReceipt",
      params: [hash]
    })) as { status?: "0x0" | "0x1" } | null;

    if (receipt) {
      return receipt;
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1500);
    });
  }

  throw new Error("Transaction confirmation timed out.");
}

function getRemainingCooldown(lastTimestamp: bigint, cooldownSeconds: number): number {
  if (lastTimestamp === 0n) {
    return 0;
  }

  const nextAvailableAt = Number(lastTimestamp) + cooldownSeconds;
  const remaining = nextAvailableAt - Math.floor(Date.now() / 1000);

  return Math.max(0, remaining);
}

function maxBigInt(left: bigint, right: bigint): bigint {
  return left > right ? left : right;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function shortWallet(value: string): string {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function numberToHex(value: number): `0x${string}` {
  return `0x${value.toString(16)}`;
}

function buildAddChainParams() {
  return {
    chainId: numberToHex(EXPECTED_CHAIN.id),
    chainName: EXPECTED_CHAIN.name,
    nativeCurrency: EXPECTED_CHAIN.nativeCurrency,
    rpcUrls: [EXPECTED_CHAIN.rpcUrls.default.http[0]],
    blockExplorerUrls: [EXPECTED_CHAIN.blockExplorers.default.url]
  };
}

function isUnknownChainError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 4902
  );
}

function parseWalletError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error || "");

  if (message.includes("Already checked in today")) {
    return "Already checked in today";
  }
  if (message.includes("GM cooldown active")) {
    return "GM cooldown active";
  }
  if (message.includes("GN cooldown active")) {
    return "GN cooldown active";
  }
  if (message.toLowerCase().includes("user rejected") || message.includes("4001")) {
    return "Transaction rejected";
  }
  if (message.toLowerCase().includes("insufficient")) {
    return "Insufficient funds";
  }
  if (message.toLowerCase().includes("chain")) {
    return `Switch to ${EXPECTED_CHAIN.name}`;
  }

  return message || "Transaction failed";
}
