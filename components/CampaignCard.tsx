import Link from "next/link";
import type { Campaign } from "@/lib/data";

function budgetColor(percent: number) {
  if (percent >= 60) return "from-emerald-300 to-lime-200";
  if (percent >= 40) return "from-amber-300 to-orange-200";
  return "from-red-400 to-orange-300";
}

function sourceLabel(source: string) {
  if (source === "reach_cat") return "Reach.cat";
  if (source === "mrktplce") return "MRKTPLCE";
  return source;
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const fillRate = campaign.budgetPctRemaining ?? Math.max(0, Math.min(100, Math.round((campaign.remainingBudget / Math.max(campaign.budget, 1)) * 100)));
  const source = campaign.sourcePlatform || (campaign.isImported ? "imported" : "manual");
  const isReachCat = source === "reach_cat";
  const submitHref = `/worker/submit?campaignId=${campaign.id}&campaignTitle=${encodeURIComponent(campaign.title)}`;

  return (
    <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.085] via-white/[0.045] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300/35">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-200">{campaign.platform}</p>
            <p className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-200">Via {sourceLabel(source)}</p>
            {isReachCat ? (
              <p className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-100">USDT</p>
            ) : null}
            {campaign.niche ? (
              <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-stone-300">{campaign.niche}</p>
            ) : null}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{campaign.title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">{campaign.description}</p>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-200">
          {campaign.status}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${budgetColor(fillRate)}`} style={{ width: `${fillRate}%` }} />
      </div>
      <p className="mt-2 text-xs text-stone-500">Budget availability: {fillRate}% remaining</p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Earn</p>
          <p className="mt-1 text-lg font-black text-white">${campaign.payoutPerThousandViews.toFixed(2)}/1K</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Source CPM</p>
          <p className="mt-1 text-lg font-black text-white">${(campaign.externalPayoutPer1k || campaign.payoutPerThousandViews).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Budget left</p>
          <p className="mt-1 text-lg font-black text-white">{fillRate}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Approval</p>
          <p className="mt-1 text-lg font-black text-white">{campaign.approvalRatePct || 95}%</p>
        </div>
      </div>

      <div className={`mt-5 rounded-2xl border p-3 text-xs leading-5 ${isReachCat ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border-amber-300/15 bg-amber-300/10 text-amber-100"}`}>
        {isReachCat
          ? "Reach.cat source: USDT payout campaign. Submit quickly, keep the clip public, and avoid fake views."
          : "Submit your clip URL within 60 minutes of posting. Late submissions are the top reason clips get rejected."}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={submitHref} className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-black shadow-lg shadow-emerald-950/30">
          Claim this campaign
        </Link>
        <Link href="/buyer/campaigns" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-stone-200">
          View rules
        </Link>
      </div>
    </article>
  );
}
