import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";

const stats = [
  { label: "Beta seats", value: "100" },
  { label: "Buyer slots", value: "10" },
  { label: "Payout review", value: "24h" },
  { label: "Launch status", value: "Closed" },
];

export default function HomePage() {
  return (
    <DashboardShell
      title="The private clip rewards desk for creators who want distribution now."
      subtitle="Fund a campaign, let vetted clippers compete for verified attention, and double down on the clips that start moving. ClipBounty is currently invite-only while we build the first operator-led network."
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/buyer/campaigns/new" className="group rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-white/[0.055] to-white/[0.025] p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-amber-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Buyer access</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight">Launch a bounty</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">Create a funded campaign for podcasts, streamers, short-form products, or private communities.</p>
          <p className="mt-6 text-sm font-bold text-amber-100">Request campaign slot →</p>
        </Link>

        <Link href="/worker/campaigns" className="group rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/15 via-white/[0.055] to-white/[0.025] p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-emerald-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Clipper rewards</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight">Claim paid drops</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">Browse limited campaigns, submit public clip links, and unlock higher caps after review.</p>
          <p className="mt-6 text-sm font-bold text-emerald-100">View active drops →</p>
        </Link>

        <Link href="/admin/clips" className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-white/[0.02] p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-white/25">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-300">Operator desk</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight">Control quality</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">Review submissions, stop low-quality traffic, and release manual payouts during beta.</p>
          <p className="mt-6 text-sm font-bold text-stone-100">Open ops panel →</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Why buyers come back</p>
          <h3 className="mt-3 text-2xl font-black">We do not sell random views. We find viral angles.</h3>
          <p className="mt-3 leading-7 text-stone-300">
            The beta is built around manual review, limited campaign slots, and fast remixing of clips that show early momentum. Buyers get distribution without hiring a full clipping team.
          </p>
        </div>
        <div className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.07] p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">FOMO rule</p>
          <h3 className="mt-3 text-2xl font-black">Closed beta only</h3>
          <p className="mt-3 leading-7 text-stone-300">
            Keep the first launch capped: 10 buyers, 100 workers, manual approval. Scarcity makes the product feel premium and protects quality.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
