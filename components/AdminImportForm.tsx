"use client";

import { useState } from "react";
import { importCampaignAction } from "@/app/actions";

type ScrapeDraft = {
  sourcePlatform: string;
  externalUrl: string;
  title: string;
  description: string;
  platform: string;
  budgetUsd: number;
  budgetPctRemaining: number;
  externalPayoutPer1k: number;
  suggestedWorkerPayoutPer1k: number;
  approvalRatePct: number;
  niche: string;
  geographicRestriction: string;
  passesFilters: boolean;
  filterReason: string | null;
  extractedTextPreview: string;
};

export function AdminImportForm() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [draft, setDraft] = useState<ScrapeDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchDraft() {
    setLoading(true);
    setError("");
    setDraft(null);

    try {
      const res = await fetch("/api/scrape-campaign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not fetch campaign draft");
      }

      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch campaign draft");
    } finally {
      setLoading(false);
    }
  }

  const isReach = draft?.sourcePlatform === "reach_cat" || sourceUrl.includes("reach.cat");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
        <label className="block text-sm font-semibold text-emerald-100" htmlFor="scrapeUrl">
          Paste a public campaign URL to pre-fill the form
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            id="scrapeUrl"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className="w-full rounded-xl border border-slate-700 p-3 text-slate-950"
            placeholder="https://reach.cat/... or https://whop.com/..."
          />
          <button
            type="button"
            onClick={fetchDraft}
            disabled={loading || !sourceUrl}
            className="rounded-xl bg-emerald-300 px-5 py-3 font-black text-black disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch campaign"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
        {draft ? (
          <div className={`mt-4 rounded-2xl border p-4 text-sm ${draft.passesFilters ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-red-300/25 bg-red-300/10 text-red-100"}`}>
            <p className="font-bold">{draft.passesFilters ? "Draft passes current filters" : "Draft failed filters"}</p>
            {draft.filterReason ? <p className="mt-1">Reason: {draft.filterReason}</p> : null}
            <p className="mt-2 text-xs opacity-80">Review every field before importing. Scraped values are guesses, not guaranteed truth.</p>
          </div>
        ) : null}
        {isReach ? (
          <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-black/25 p-4 text-sm text-emerald-100">
            Reach.cat preset active: global audience, USDT badge, and worker CPM defaults optimized for $1-$6 source CPM campaigns.
          </div>
        ) : null}
      </div>

      <form action={importCampaignAction} className="max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="sourcePlatform">Source platform</label>
            <select id="sourcePlatform" name="sourcePlatform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue={draft?.sourcePlatform || "reach_cat"} key={`source-${draft?.sourcePlatform || "reach_cat"}`}>
              <option value="reach_cat">Reach.cat</option>
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
            <input id="externalUrl" name="externalUrl" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Paste source campaign URL" defaultValue={draft?.externalUrl || sourceUrl} key={`url-${draft?.externalUrl || sourceUrl}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="title">Campaign title</label>
            <input id="title" name="title" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Reach.cat Fitness Clip Campaign" defaultValue={draft?.title || ""} key={`title-${draft?.title || ""}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="platform">Primary platform</label>
            <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue={draft?.platform || "tiktok"} key={`platform-${draft?.platform || "tiktok"}`}>
              <option value="youtube">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budgetUsd">Total source budget USD</label>
            <input id="budgetUsd" name="budgetUsd" required type="number" min="1" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="1000" defaultValue={draft?.budgetUsd || 1000} key={`budget-${draft?.budgetUsd || 1000}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="budgetPctRemaining">Budget remaining %</label>
            <input id="budgetPctRemaining" name="budgetPctRemaining" required type="number" min="0" max="100" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="90" defaultValue={draft?.budgetPctRemaining || 90} key={`remaining-${draft?.budgetPctRemaining || 90}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="externalPayoutPer1k">Source pays per 1K views</label>
            <input id="externalPayoutPer1k" name="externalPayoutPer1k" required type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="2.00" defaultValue={draft?.externalPayoutPer1k || 2} key={`source-cpm-${draft?.externalPayoutPer1k || 2}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="ourPayoutPer1k">Worker payout per 1K views</label>
            <input id="ourPayoutPer1k" name="ourPayoutPer1k" type="number" min="0.01" step="0.01" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Reach default: 0.25-0.50" defaultValue={draft?.suggestedWorkerPayoutPer1k || "0.35"} key={`worker-cpm-${draft?.suggestedWorkerPayoutPer1k || "0.35"}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="approvalRatePct">Creator approval rate %</label>
            <input id="approvalRatePct" name="approvalRatePct" required type="number" min="0" max="100" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="100" defaultValue={draft?.approvalRatePct || 100} key={`approval-${draft?.approvalRatePct || 100}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="geographicRestriction">Geographic restriction</label>
            <select id="geographicRestriction" name="geographicRestriction" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue={draft?.geographicRestriction || "global"} key={`geo-${draft?.geographicRestriction || "global"}`}>
              <option value="global">Global / any audience</option>
              <option value="us_only">US only</option>
              <option value="eu_only">EU only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="niche">Niche</label>
            <input id="niche" name="niche" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="fitness, crypto, gaming, motivation, music, ai-tech" defaultValue={draft?.niche || "fitness"} key={`niche-${draft?.niche || "fitness"}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="requiredHashtags">Required hashtags</label>
            <input id="requiredHashtags" name="requiredHashtags" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="#fitness, #mobility" />
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Paste campaign description here." defaultValue={draft?.description || ""} key={`description-${draft?.description || ""}`} />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="rules">Rules</label>
        <textarea id="rules" name="rules" rows={5} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One rule per line. Include campaign rules, source video rules, and submission rules." defaultValue={draft?.extractedTextPreview || "Global audience accepted\nUSDT payout source\nNo fake views\nSubmit clip URLs quickly after posting"} key={`rules-${draft?.extractedTextPreview || "reach-default"}`} />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="sourceAssetUrls">Source asset URLs</label>
        <textarea id="sourceAssetUrls" name="sourceAssetUrls" rows={3} className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="One asset URL per line" />

        <button type="submit" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Import qualifying campaign
        </button>
      </form>
    </div>
  );
}
