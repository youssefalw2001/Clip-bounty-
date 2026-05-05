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

function formatSol(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function GhostScanner() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GhostScanResult | null>(null);
  const [error, setError] = useState("");

  const feePreview = useMemo(() => {
    if (!result) return 0;
    return result.reclaimableSol * 0.07;
  }, [result]);

  async function scan() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ghost/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet }),
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

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-2xl shadow-emerald-950/20 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Read-only wallet scan</p>
        <label htmlFor="ghost-wallet" className="mt-4 block text-sm font-bold text-stone-200">
          Paste a public Solana wallet address
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
            onClick={scan}
            disabled={loading || !wallet}
            className="min-h-14 rounded-2xl bg-emerald-300 px-6 py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-emerald-950/30 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan wallet"}
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-emerald-100/80">
          GhostWallet never asks for seed phrases, private keys, or token approvals. This MVP only reads public Solana wallet data.
        </p>
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
              <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Claimable SOL</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(result.reclaimableSol)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Success fee preview</p>
              <p className="mt-2 text-3xl font-black text-white">{formatSol(feePreview)}</p>
              <p className="mt-1 text-xs text-stone-500">Example 7% fee, not charged in this read-only MVP.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Mode</p>
              <p className="mt-2 text-2xl font-black text-white">Read-only</p>
              <p className="mt-1 text-xs text-stone-500">No funds can move from this scan.</p>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-white">Empty token accounts</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-stone-300">
                showing {result.accounts.length}
              </span>
            </div>
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
    </div>
  );
}
