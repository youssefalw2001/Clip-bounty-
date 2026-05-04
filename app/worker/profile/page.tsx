import { saveWorkerProfileAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { UserIdentityInput } from "@/components/UserIdentityInput";

export const dynamic = "force-dynamic";

const niches = [
  ["crypto", "Crypto and Web3"],
  ["gaming", "Gaming (BGMI, FreeFire, global streams)"],
  ["motivation", "Motivation and entrepreneurship"],
  ["music", "Music content"],
  ["ai-tech", "AI and technology"],
  ["finance", "Finance and investing"],
  ["ecommerce", "Ecommerce and products"],
  ["fitness", "Fitness and wellness"],
];

export default function WorkerProfilePage() {
  return (
    <DashboardShell
      title="Complete your clipper profile"
      subtitle="Set your payout wallet, social accounts, and niches so we can match you with campaigns that fit your audience."
    >
      <form action={saveWorkerProfileAction} className="max-w-5xl rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30">
        <UserIdentityInput />

        <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          Profile is required before claiming campaigns. You need a TON wallet, at least one social handle, and at least one niche.
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="displayName">Display name</label>
            <input id="displayName" name="displayName" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Aman Clips" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="country">Country</label>
            <select id="country" name="country" className="mt-2 w-full rounded-xl border border-slate-700 p-3" defaultValue="IN">
              <option value="IN">India</option>
              <option value="PK">Pakistan</option>
              <option value="BD">Bangladesh</option>
              <option value="PH">Philippines</option>
              <option value="ID">Indonesia</option>
              <option value="VN">Vietnam</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="tonWalletAddress">TON wallet address</label>
            <input id="tonWalletAddress" name="tonWalletAddress" required className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="Paste your payout wallet address" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-black text-white">Social accounts</h2>
          <p className="mt-2 text-sm text-slate-400">Add at least one account you can post clips from.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="block text-sm font-semibold text-slate-200" htmlFor="tiktokHandle">TikTok handle</label>
              <input id="tiktokHandle" name="tiktokHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="@username" />
              <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="tiktokFollowers">Followers</label>
              <input id="tiktokFollowers" name="tiktokFollowers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="block text-sm font-semibold text-slate-200" htmlFor="instagramHandle">Instagram handle</label>
              <input id="instagramHandle" name="instagramHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="@username" />
              <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="instagramFollowers">Followers</label>
              <input id="instagramFollowers" name="instagramFollowers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="block text-sm font-semibold text-slate-200" htmlFor="youtubeHandle">YouTube Shorts handle</label>
              <input id="youtubeHandle" name="youtubeHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="@channel" />
              <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="youtubeSubscribers">Subscribers</label>
              <input id="youtubeSubscribers" name="youtubeSubscribers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-3" placeholder="0" />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-black text-white">Skills and niches</h2>
          <p className="mt-2 text-sm text-slate-400">Choose the topics your audience responds to best.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {niches.map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-semibold text-slate-200">
                <input type="checkbox" name="niches" value={value} className="h-4 w-4" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="mt-8 rounded-2xl bg-emerald-300 px-6 py-4 font-black text-black shadow-lg shadow-emerald-950/30">
          Save profile and unlock campaigns
        </button>
      </form>
    </DashboardShell>
  );
}
