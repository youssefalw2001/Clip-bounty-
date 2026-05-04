import { DashboardShell } from "@/components/DashboardShell";

export default function SubmitClipPage() {
  return (
    <DashboardShell
      title="Submit a clip"
      subtitle="Paste the public TikTok, YouTube Shorts, or Instagram Reels link you posted for a campaign."
    >
      <form className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <label className="block text-sm font-semibold text-slate-200" htmlFor="campaign">
          Campaign ID
        </label>
        <input id="campaign" name="campaign" placeholder="camp_001" className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="platform">
          Platform
        </label>
        <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3">
          <option>YouTube</option>
          <option>TikTok</option>
          <option>Instagram</option>
        </select>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="url">
          Clip URL
        </label>
        <input id="url" name="url" placeholder="https://youtube.com/shorts/..." className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="wallet">
          TON wallet address
        </label>
        <input id="wallet" name="wallet" placeholder="Your TON wallet for manual beta payouts" className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <button type="button" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Submit for review
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Beta note: this form is UI-only right now. The next step is wiring it to Postgres through server actions.
        </p>
      </form>
    </DashboardShell>
  );
}
