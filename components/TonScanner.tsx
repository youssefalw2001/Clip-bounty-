"use client";

import { useState } from "react";

type TonAsset = {
  name: string;
  symbol: string;
  balance: number;
  rawBalance: string;
  decimals: number;
  image?: string | null;
  walletAddress?: string | null;
  jettonAddress?: string | null;
  verification?: string;
};

type TonScanResult = {
  wallet: string;
  scannedAt: string;
  chain: "ton";
  tonBalance: number;
  status: string;
  interfaces: string[];
  jettonCount: number;
  suspiciousAssetCount: number;
  assets: TonAsset[];
  opportunities: string[];
  safety: string;
};

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function TonScanner() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TonScanResult | null>(null);
  const [error, setError] = useState("");

  async function scanTon() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ghost/ton-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "TON scan failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "TON scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-2xl shadow-cyan-950/20 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">TON scanner</p>
          <h2 className="mt-3 text-2xl font-black text-white">Scan a TON wallet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-100/80">
            TON does not use Solana-style rent recovery. This scanner finds TON balance, jettons, and suspicious/unverified assets so GhostWallet can become a Telegram-native wallet dashboard.
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-100">
          Read-only
        </span>
      </div>

      <label htmlFor="ton-wallet" className="mt-6 block text-sm font-bold text-stone-200">
        Paste a public TON wallet address
      </label>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
        <input
          id="ton-wallet"
          value={wallet}
          onChange={(event) => setWallet(event.target.value.trim())}
          placeholder="Example: UQ... or EQ..."
          className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm font-semibold text-white outline-none ring-cyan-300/40 transition placeholder:text-stone-600 focus:ring-4"
        />
        <button
          type="button"
          onClick={scanTon}
          disabled={loading || !wallet}
          className="min-h-14 rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-cyan-950/30 disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan TON"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">TON wallet report</p>
            <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
              {formatNumber(result.tonBalance)} TON
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              {result.jettonCount} jetton balances detected · {result.suspiciousAssetCount} unverified/unknown assets flagged
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-200">TON balance</p>
              <p className="mt-2 text-3xl font-black text-white">{formatNumber(result.tonBalance)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Jettons</p>
              <p className="mt-2 text-3xl font-black text-white">{result.jettonCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">Status</p>
              <p className="mt-2 text-2xl font-black text-white">{result.status}</p>
            </div>
          </div>

          <div className="border-t border-white/10 p-5">
            <h4 className="text-lg font-black text-white">Opportunities</h4>
            <div className="mt-3 grid gap-2">
              {result.opportunities.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-stone-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h4 className="text-lg font-black text-white">Jettons / tokens</h4>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-stone-300">
                showing {result.assets.length}
              </span>
            </div>
            <div className="space-y-3">
              {result.assets.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-stone-300">
                  No jetton balances detected for this wallet.
                </p>
              ) : null}
              {result.assets.map((asset) => (
                <div key={`${asset.jettonAddress || asset.symbol}-${asset.rawBalance}`} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{asset.name} · {asset.symbol}</p>
                      <p className="mt-1 truncate text-xs text-stone-500">Verification: {asset.verification || "unknown"}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-cyan-200">{formatNumber(asset.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-5 text-sm leading-6 text-cyan-100/80">
            {result.safety}
          </div>
        </div>
      ) : null}
    </section>
  );
}
