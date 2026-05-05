"use client";

import { useMemo, useState } from "react";

type GhostScanResult = {
  wallet: string;
  scannedAt: string;
  totalTokenAccounts: number;
  emptyTokenAccounts: number;
  reclaimableLamports: number;
  reclaimableSol: number;
  accounts: Array<{
    address: string;
    mint: string;
    lamports: number;
    reclaimableSol: number;
  }>;
  safety: string;
};

type RecoveryPlan = {
  wallet: string;
  generatedAt: string;
  mode: string;
  totalAccountsScanned: number;
  accountsToClose: number;
  reclaimableSol: number;
  feeBps: number;
  feeSol: number;
  userReceivesSol: number;
  signingStatus: string;
  nextStep: string;
  safety: string;
  accounts: Array<{
    address: string;
    mint: string;
    programId: string;
    reclaimableSol: number;
  }>;
};

type SolanaProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
};

declare global {
  interface Window {
    solana?: SolanaProvider;
    solflare?: SolanaProvider;
  }
}

function formatSol(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function shortWallet(value: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function GhostScanner() {
  const [wallet, setWallet] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [walletSource, setWalletSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [result, setResult] = useState<GhostScanResult | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  const [error, setError] = useState("");
  const [planError, setPlanError] = useState("");

  const feePreview = useMemo(() => {
    if (!result) return 0;
    return result.reclaimableSol * 0.07;
  }, [result]);

  async function connectWallet() {
    setConnecting(true);
    setError("");
    setPlanError("");
    setRecoveryPlan(null);

    try {
      const provider = window.solana || window.solflare;
      if (!provider) {
        throw new Error("No Solana wallet found. Open this page in a browser with Phantom, Solflare, or Backpack installed.");
      }

      const response = await provider.connect();
      const address = response.publicKey.toString();
      setConnectedWallet(address);
      setWallet(address);
      setWalletSource(provider.isPhantom ? "Phantom" : provider.isSolflare ? "Solflare" : "Solana wallet");
      await scan(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect wallet.");
    } finally {
      setConnecting(false);
    }
  }

  async function scan(walletOverride?: string) {
    const targetWallet = (walletOverride || wallet).trim();
    setLoading(true);
    setError("");
    setPlanError("");
    setResult(null);
    setRecoveryPlan(null);

    try {
      const res = await fetch("/api/ghost/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: targetWallet }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Scan failed");

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function prepareRecovery() {
    const targetWallet = wallet.trim();
    setPreparing(true);
    setPlanError("");
    setRecoveryPlan(null);

    try {
      const res = await fetch("/api/ghost/recovery-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: targetWallet }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not prepare recovery plan");

      setRecoveryPlan(data);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Could not prepare recovery plan");
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-2xl shadow-emerald-950/20 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Wallet scanner</p>
        <h2 className="mt-3 text-2xl font-black text-white">Connect or paste a public Solana wallet</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-100/80">
          GhostWallet never asks for seed phrases or private keys. Wallet connection only reads your public address in this build.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={connectWallet}
            disabled={connecting || loading}
            className="min-h-14 rounded-2xl bg-emerald-300 px-6 py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-emerald-950/30 disabled:opacity-50"
          >
            {connecting ? "Connecting..." : connectedWallet ? `Connected: ${shortWallet(connectedWallet)}` : "Connect wallet"}
          </button>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-300">
            {connectedWallet ? `${walletSource || "Wallet"} connected. Scan uses your public wallet address only.` : "Works with browser wallets like Phantom, Solflare, or Backpack when available."}
          </div>
        </div>

        <label htmlFor="ghost-wallet" className="mt-6 block text-sm font-bold text-stone-200">
          Or paste a public wallet address manually
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            id="ghost-wallet"
            value={wallet}
            onChange={(event) => setWallet(event.target.value.trim())}
            placeholder="Example: 9xQeWvG816bUx9EP..."
            className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm font-semibold text-white outline-none ring-emerald-300/40 transition placeholder:text-stone-600 focus:ring-4"
          />
          <button
            type="button"
            onClick={() => scan()}
            disabled={loading || !wallet}
            className="min-h-14 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-black/30 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan wallet"}
          </button>
        </div>
        {error ? <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p> : null}
      </section>

      {result ? (
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 bg-black/40 p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Ghost balance report</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              {formatSol(result.reclaimableSol)} SOL
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Found across {result.emptyTokenAccounts} empty token accounts from {result.totalTokenAccounts} scanned accounts.
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Claimable SOL estimate</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(result.reclaimableSol)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Fee preview</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(feePreview)}</p>
              <p className="mt-1 text-xs text-stone-500">Example 7% success fee, not charged in this scan build.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Next build</p>
              <p className="mt-2 text-2xl font-black text-white">Sign recovery</p>
              <p className="mt-1 text-xs text-stone-500">User-signed close-account actions are next.</p>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Empty token accounts</h3>
                <p className="mt-1 text-xs text-stone-500">Review the accounts before preparing recovery.</p>
              </div>
              <button
                type="button"
                onClick={prepareRecovery}
                disabled={preparing || result.emptyTokenAccounts === 0}
                className="rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black uppercase tracking-widest text-black disabled:opacity-50"
              >
                {preparing ? "Preparing..." : "Prepare recovery"}
              </button>
            </div>
            {planError ? <p className="mb-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{planError}</p> : null}
            <div className="space-y-3">
              {result.accounts.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-stone-300">
                  No reclaimable empty token accounts detected for this wallet.
                </p>
              ) : null}
              {result.accounts.map((account) => (
                <div key={account.address} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{account.address}</p>
                      <p className="mt-1 truncate text-xs text-stone-500">Mint: {account.mint}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-emerald-200">{formatSol(account.reclaimableSol)} SOL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {recoveryPlan ? (
        <section className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100 shadow-2xl shadow-black/25 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Recovery plan prepared</p>
          <h2 className="mt-3 text-3xl font-black text-white">Ready to recover {formatSol(recoveryPlan.reclaimableSol)} SOL</h2>
          <p className="mt-3 text-sm leading-6">
            GhostWallet found {recoveryPlan.accountsToClose} token accounts that can be closed after user approval. This build does not sign or send the transaction yet.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">User receives</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(recoveryPlan.userReceivesSol)} SOL</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Ghost fee</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(recoveryPlan.feeSol)} SOL</p>
              <p className="mt-1 text-xs text-stone-500">{recoveryPlan.feeBps / 100}% preview</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Signing</p>
              <p className="mt-2 text-2xl font-black text-white">Disabled</p>
              <p className="mt-1 text-xs text-stone-500">Next build enables wallet-signed recovery.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-bold text-white">Safety check</p>
            <p className="mt-2 text-sm leading-6 text-amber-100/80">{recoveryPlan.safety}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
