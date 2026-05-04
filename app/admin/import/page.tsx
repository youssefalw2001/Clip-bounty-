import { importCampaignAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <DashboardShell
      title="Import campaign"
      subtitle="Add Whop, Vyro, MRKTPLCE, or manual source campaigns after checking geo, budget, and approval filters."
    >
      <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
        Import rules: skip campaigns requiring US audience, skip campaigns under 40% budget remaining, and skip creators below 80% approval rate.
      </div>

      <form action={importCampaignAction} className="max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="sourcePlatform">Source platform</label>
            <select id="sourcePlatform" name="sourcePlatform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="whop">
              <option value="whop">Whop</option>
              <option value="vyro">Vyro</option>
              <option value="mrktplce">MRKTPLCE</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="externalCampaignId">External campaign ID</label>
            <input id="externalCampaignId" name="externalCampaignId" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="optional-source-id" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="externalUrl">Source URL</label>
            <input id="externalUrl" name="externalUrl" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Paste source campaign URL" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="title">Campaign title</label>
            <input id="title" name="title" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Global Gaming Clip Campaign" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="platform">Primary platform</label>
            <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="youtube">
              <option value="youtube">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budgetUsd">Total source budget USD</label>
            <input id="budgetUsd" name="budgetUsd" required type="number" min="1" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="1000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budgetPctRemaining">Budget remaining %</label>
            <input id="budgetPctRemaining" name="budgetPctRemaining" required type="number" min="0" max="100" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="80" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="externalPayoutPer1k">Source pays per 1K views</label>
            <input id="externalPayoutPer1k" name="externalPayoutPer1k" required type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="1.00" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="ourPayoutPer1k">Worker payout per 1K views</label>
            <input id="ourPayoutPer1k" name="ourPayoutPer1k" type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Auto-calculated if blank" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="approvalRatePct">Creator approval rate %</label>
            <input id="approvalRatePct" name="approvalRatePct" required type="number" min="0" max="100" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="90" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="geographicRestriction">Geographic restriction</label>
            <select id="geographicRestriction" name="geographicRestriction" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="global">
              <option value="global">Global / any audience</option>
              <option value="us_only">US only</option>
              <option value="eu_only">EU only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="niche">Niche</label>
            <input id="niche" name="niche" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="crypto, gaming, motivation, music, ai-tech" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="requiredHashtags">Required hashtags</label>
            <input id="requiredHashtags" name="requiredHashtags" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="#crypto, #web3" />
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Paste campaign description here." />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="rules">Rules</label>
        <textarea id="rules" name="rules" rows={5} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One rule per line. Include geography, approval rules, submission deadlines, and required CTA." />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="sourceAssetUrls">Source asset URLs</label>
        <textarea id="sourceAssetUrls" name="sourceAssetUrls" rows={3} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One asset URL per line" />

        <button type="submit" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Import qualifying campaign
        </button>
      </form>
    </DashboardShell>
  );
}
