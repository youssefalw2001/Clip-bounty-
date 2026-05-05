"use client";

import { useEffect, useMemo, useState } from "react";
import { submitClipAction } from "@/app/actions";
import { UserIdentityInput } from "@/components/UserIdentityInput";

type WorkerSubmitFlowProps = {
  campaignId?: string;
  campaignTitle?: string;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function WorkerSubmitFlow({ campaignId = "", campaignTitle = "Selected campaign" }: WorkerSubmitFlowProps) {
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!timerStartedAt) return 60 * 60;
    return Math.max(0, 60 * 60 - Math.floor((now - timerStartedAt) / 1000));
  }, [now, timerStartedAt]);

  const timerColor = remainingSeconds <= 15 * 60
    ? "border-red-300/30 bg-red-300/10 text-red-100"
    : remainingSeconds <= 30 * 60
      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
      : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-2xl shadow-black/25">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Submitting for</p>
        <h2 className="mt-2 text-2xl font-black text-white">{campaignTitle}</h2>
        {campaignId ? (
          <p className="mt-2 break-all text-xs text-emerald-100/70">Campaign locked in from your claim button.</p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-red-100">No campaign selected. Go back to Worker Campaigns and tap Claim this campaign.</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Step 1</p>
          <h3 className="mt-2 text-xl font-black text-white">Watch the source content</h3>
          <p className="mt-2 text-sm leading-6 text-stone-300">Read the campaign rules and understand the hook, niche, hashtags, and target platform before editing.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Step 2</p>
          <h3 className="mt-2 text-xl font-black text-white">Create your clip</h3>
          <p className="mt-2 text-sm leading-6 text-stone-300">Use CapCut, InShot, or your editor. Keep it 15-90 seconds, add captions, and use a strong first 3 seconds.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Step 3</p>
          <h3 className="mt-2 text-xl font-black text-white">Post publicly</h3>
          <p className="mt-2 text-sm leading-6 text-stone-300">Post on TikTok, Instagram Reels, or YouTube Shorts. Keep the clip public and do not delete it.</p>
        </div>
        <div className={`rounded-3xl border p-5 ${timerColor}`}>
          <p className="text-xs font-black uppercase tracking-[0.22em] opacity-80">Step 4</p>
          <h3 className="mt-2 text-xl font-black text-white">Submit within 60 minutes</h3>
          <p className="mt-2 text-sm leading-6 opacity-90">Time remaining: <span className="font-black">{formatTime(remainingSeconds)}</span></p>
          <button
            type="button"
            onClick={() => setTimerStartedAt(Date.now())}
            className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black"
          >
            {timerStartedAt ? "Restart timer" : "I posted my clip — start timer"}
          </button>
        </div>
      </div>

      <form action={submitClipAction} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/30 md:p-6">
        <UserIdentityInput />
        <input type="hidden" name="campaignId" value={campaignId} />

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          Paste the public URL after posting. Late or private clips may be rejected during review.
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="platform">
          Platform
        </label>
        <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" defaultValue="tiktok">
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram Reels</option>
          <option value="youtube">YouTube Shorts</option>
        </select>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="url">
          Clip URL
        </label>
        <input id="url" name="url" required placeholder="Paste your public clip link" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="walletAddress">
          TON wallet address
        </label>
        <input id="walletAddress" name="walletAddress" required placeholder="Your TON wallet for manual beta payouts" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" />

        <button type="submit" disabled={!campaignId || remainingSeconds === 0} className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 disabled:opacity-50 md:w-auto">
          Submit clip for review
        </button>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          After submission, admin reviews the clip. If approved, views are tracked and earnings appear in your dashboard.
        </p>
      </form>
    </div>
  );
}
