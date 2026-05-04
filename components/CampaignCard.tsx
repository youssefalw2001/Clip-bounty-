import Link from "next/link";
import type { Campaign } from "@/lib/data";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-emerald-400">{campaign.platform}</p>
          <h2 className="mt-1 text-xl font-bold">{campaign.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{campaign.description}</p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {campaign.status}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-400">Worker CPM</p>
          <p className="mt-1 font-bold">${campaign.payoutPerThousandViews.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-400">Budget</p>
          <p className="mt-1 font-bold">${campaign.budget}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-400">Left</p>
          <p className="mt-1 font-bold">${campaign.remainingBudget}</p>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Link href={`/worker/submit?campaign=${campaign.id}`} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
          Submit clip
        </Link>
        <Link href="/buyer/campaigns" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">
          View rules
        </Link>
      </div>
    </article>
  );
}
