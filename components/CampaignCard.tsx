import Link from "next/link";
import type { Campaign } from "@/lib/data";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const fillRate = Math.max(0, Math.min(100, Math.round((campaign.remainingBudget / Math.max(campaign.budget, 1)) * 100)));

  return (
    <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.085] via-white/[0.045] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300/35">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-200">{campaign.platform}</p>
            <p className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-200">limited drop</p>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{campaign.title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">{campaign.description}</p>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-200">
          {campaign.status}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200" style={{ width: `${fillRate}%` }} />
      </div>
      <p className="mt-2 text-xs text-stone-500">Budget availability: {fillRate}% remaining</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Reward CPM</p>
          <p className="mt-1 text-lg font-black text-white">${campaign.payoutPerThousandViews.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Budget</p>
          <p className="mt-1 text-lg font-black text-white">${campaign.budget}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Left</p>
          <p className="mt-1 text-lg font-black text-white">${campaign.remainingBudget}</p>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Link href={`/worker/submit?campaign=${campaign.id}`} className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-black shadow-lg shadow-emerald-950/30">
          Claim bounty
        </Link>
        <Link href="/buyer/campaigns" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-stone-200">
          View rules
        </Link>
      </div>
    </article>
  );
}
