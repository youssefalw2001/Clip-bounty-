import { submitClipAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { UserIdentityInput } from "@/components/UserIdentityInput";

export default function SubmitClipPage() {
  return (
    <DashboardShell
      title="Submit a clip"
      subtitle="Paste the public TikTok, YouTube Shorts, or Instagram Reels link you posted for a campaign."
    >
      <form action={submitClipAction} className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <UserIdentityInput />
        <label className="block text-sm font-semibold text-slate-200" htmlFor="campaignId">
          Campaign UUID
        </label>
        <input id="campaignId" name="campaignId" required placeholder="Paste campaign UUID from the buyer/admin dashboard" className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="platform">
          Platform
        </label>
        <select id="platform" name="platform" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="youtube">
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="url">
          Clip URL
        </label>
        <input id="url" name="url" required placeholder="Paste your public clip link" className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="walletAddress">
          TON wallet address
        </label>
        <input id="walletAddress" name="walletAddress" required placeholder="Your TON wallet for manual beta payouts" className="mt-2 w-full rounded-xl border border-slate-700 p-3" />

        <button type="submit" className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Submit for review
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Beta note: submissions now save under your unique Telegram or browser session identity.
        </p>
      </form>
    </DashboardShell>
  );
}
