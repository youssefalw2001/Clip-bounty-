import { DashboardShell } from "@/components/DashboardShell";

export default function NewCampaignPage() {
  return (
    <DashboardShell
      title="Create a campaign"
      subtitle="Set the campaign details, worker CPM, budget, rules, and platform. Database saving comes in the next step."
    >
      <form className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="title">Campaign title</label>
            <input id="title" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Podcast clip campaign" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="platform">Platform</label>
            <select id="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3">
              <option>YouTube Shorts</option>
              <option>TikTok</option>
              <option>Instagram Reels</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budget">Budget USD</label>
            <input id="budget" type="number" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="cpm">Worker payout per 1k views</label>
            <input id="cpm" type="number" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0.25" />
          </div>
        </div>
        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="description">Description</label>
        <textarea id="description" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Describe what workers should clip and post." />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="rules">Rules</label>
        <textarea id="rules" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One rule per line. Include hashtags, CTA, banned claims, and approval requirements." />

        <button type="button" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Save draft campaign
        </button>
      </form>
    </DashboardShell>
  );
}
