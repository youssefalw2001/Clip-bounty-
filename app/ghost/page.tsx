import Link from "next/link";
import { GhostScanner } from "@/components/GhostScanner";

export const dynamic = "force-dynamic";

export default function GhostWalletPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-stone-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/ghost" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-lg font-black text-emerald-200">
            GW
          </span>
          <span className="text-xl font-black tracking-tight">GhostWallet</span>
        </Link>
        <Link href="/app" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-200">
          ClipBounty app
        </Link>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-10 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              Solana recovery scanner
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">
              Find money hiding in your wallet.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-300">
              GhostWallet scans public Solana wallet data for empty token accounts that may have reclaimable SOL rent. No seed phrase. No private key. No approvals.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500">Step 1</p>
                <p className="mt-2 font-black text-white">Paste wallet</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500">Step 2</p>
                <p className="mt-2 font-black text-white">Scan ghosts</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500">Step 3</p>
                <p className="mt-2 font-black text-white">Recover later</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
              <h2 className="font-black text-white">MVP safety notice</h2>
              <p className="mt-2 text-sm leading-6">
                This first build only scans. The next build will add wallet connect and user-signed close-account transactions for wallets the user owns.
              </p>
            </div>
          </div>

          <GhostScanner />
        </div>
      </section>
    </main>
  );
}
