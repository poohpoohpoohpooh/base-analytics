# Base Mainnet Wallet Analytics Dashboard

Dark themed Next.js dashboard for analyzing a Base Mainnet wallet address or Basename.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `ALCHEMY_API_KEY` in `.env.local`. The app uses `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` for Base Mainnet balance and activity analytics.

`BASESCAN_API_KEY` or `ETHERSCAN_API_KEY` can still be set as a fallback. Explorer-specific V1 endpoints have moved to Etherscan API V2, so the fallback uses `https://api.etherscan.io/v2/api` with `chainid=8453` for Base. API keys are only read inside `/api/analyze` and are not exposed to the browser.

`BASE_RPC_URL` defaults to `https://mainnet.base.org`. For Basename resolution, set `ETHEREUM_RPC_URL` to a reliable Ethereum Mainnet RPC when deploying to Vercel.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run deploy:actions:baseSepolia
npm run deploy:actions:base
```

## Onchain Actions

The dashboard includes optional Daily Check-in / GM / GN buttons. These call a dedicated `BaseIdentityActions` contract that emits events and stores simple per-wallet counters with cooldowns.

Deploy to Base Sepolia first:

```bash
PRIVATE_KEY=0x... npm run deploy:actions:baseSepolia
```

Then add the printed address to `.env.local`:

```bash
NEXT_PUBLIC_BASE_IDENTITY_ACTIONS_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
```

For Base Mainnet, deploy with `npm run deploy:actions:base` and set `NEXT_PUBLIC_CHAIN_ID=8453`. The frontend will prompt the wallet to connect, switch to the configured chain, send the selected action transaction, wait for the receipt, then refresh `totalCheckIns`, `totalGMs`, and `totalGNs`.

## Metric Notes

- `NFTs Held` uses Alchemy NFT API v3 `getNFTsForOwner` on Base Mainnet with `withMetadata=false`. The API is paged with `pageKey`; the app sums `ownedNfts.length` across pages. If the request fails, the value is `N/A`. If the wallet has no NFTs, the value is `0`.
- `Swap-like TXs` is an estimate. In the Alchemy path, the app reads ERC-20 transfers from `alchemy_getAssetTransfers`, groups them by `transactionHash`, and counts each hash once when the wallet has both outgoing and incoming ERC-20 transfers with different token contracts/assets in the same transaction. Native ETH-only swaps are not included in this estimate.
- `DeFi-like TXs` is allowlist based. The app only counts transactions/transfers touching addresses in `BASE_DEFI_CONTRACTS` in `lib/analyze.ts`. If the allowlist is empty, the value is `N/A` rather than a reused `contractTransactions` or `uniqueContracts` value.

Current Base DeFi allowlist:

```text
0x2626664c2603336e57b271c5c0b26f421741e481 - Uniswap Swap Router
0x6ff5693b99212da76ad316178a184ab56d299b43 - Uniswap Universal Router
0x000000000022d473030f116ddee9f6b43ac78ba3 - Permit2
0xcf77a3ba9a5ca399b7c97c74d54e5bf3dc460e43 - Aerodrome Router
0x327df1e6de05895d2ab08513aaade4e6a33d928a - BaseSwap Router
```

## Score Notes

- `Activity Score` is an estimate from multiple wallet activity metrics and stays capped at `0-100`.
- The primary score drivers are `Days on Base`, `Active Days`, `Total Transactions`, `Contract TX`, `Unique Contracts`, and `Longest Streak`.
- `Swap-like TXs`, `DeFi-like TXs`, and `NFTs Held` are helper signals, not primary rank drivers.
- `NFTs Held` has a small weight so NFT count cannot dominate the score.
- `Base God` requires both `score >= 88` and minimum activity thresholds: `daysOnBase >= 365`, `activeDays >= 180`, `totalTransactions >= 1000`, `contractTransactions >= 500`, `uniqueContracts >= 100`, and `longestStreak >= 30`. Wallets that score 88+ but miss these thresholds remain `Native`.
