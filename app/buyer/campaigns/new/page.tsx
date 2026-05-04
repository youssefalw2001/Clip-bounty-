import { createCampaignAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";

export default function NewCampaignPage() {
  return (
    <DashboardShell
      title="Create a campaign"
      subtitle="Set the campaign details, buyer CPM, worker CPM, budget, rules, and platform. This now saves into Postgres."
    >
      <form action={createCampaignAction} className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="title">Campaign title</label>
            <input id="title" name="title" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Podcast clip campaign" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="platform">Platform</label>
            <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="youtube">
              <option value="youtube">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budgetUsd">Budget USD</label>
            <input id="budgetUsd" name="budgetUsd" required type="number" min="1" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="buyerCpmUsd">Buyer cost per 1k views</label>
            <input id="buyerCpmUsd" name="buyerCpmUsd" required type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0.60" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="workerCpmUsd">Worker payout per 1k views</label>
            <input id="workerCpmUsd" name="workerCpmUsd" required type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0.25" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="landingUrl">Landing URL</label>
            <input id="landingUrl" name="landingUrl" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="https://example.com" />
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Describe what workers should clip and post." />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="requiredHashtags">Required hashtags</label>
        <input id="requiredHashtags" name="requiredHashtags" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="#clipbounty, #buyername" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="rules">Rules</label>
        <textarea id="rules" name="rules" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One rule per line. Include hashtags, CTA, banned claims, and approval requirements." />

        <button type="submit" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Save active campaign
        </button>
      </form>
    </DashboardShell>
  );
}
