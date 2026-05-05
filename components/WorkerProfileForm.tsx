"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserId } from "@/lib/identity";

const niches = [
  ["crypto", "Crypto and Web3"],
  ["gaming", "Gaming"],
  ["motivation", "Motivation"],
  ["music", "Music"],
  ["ai-tech", "AI and technology"],
  ["finance", "Finance"],
  ["ecommerce", "Ecommerce"],
  ["fitness", "Fitness"],
];

export function WorkerProfileForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>(["crypto"]);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  function toggleNiche(value: string) {
    setSelectedNiches((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const payload = {
      userId,
      displayName: String(form.get("displayName") || ""),
      tonWalletAddress: String(form.get("tonWalletAddress") || ""),
      country: String(form.get("country") || "IN"),
      tiktokHandle: String(form.get("tiktokHandle") || ""),
      tiktokFollowers: Number(form.get("tiktokFollowers") || 0),
      instagramHandle: String(form.get("instagramHandle") || ""),
      instagramFollowers: Number(form.get("instagramFollowers") || 0),
      youtubeHandle: String(form.get("youtubeHandle") || ""),
      youtubeSubscribers: Number(form.get("youtubeSubscribers") || 0),
      niches: selectedNiches,
    };

    try {
      const res = await fetch("/api/worker/save-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not save profile");
      }

      setSuccess("Profile saved. Opening worker rewards...");
      router.push("/worker/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-5xl rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 md:p-6">
      <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
        Complete this once to unlock campaigns. Add a wallet, one social handle, and at least one niche.
      </div>

      {error ? <div className="mb-5 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-sm font-semibold text-red-100">{error}</div> : null}
      {success ? <div className="mb-5 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-100">{success}</div> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-200" htmlFor="displayName">Display name</label>
          <input id="displayName" name="displayName" required className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="Aman Clips" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-200" htmlFor="country">Country</label>
          <select id="country" name="country" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" defaultValue="IN">
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
          <input id="tonWalletAddress" name="tonWalletAddress" required className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="Paste your payout wallet address" />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black text-white">Social accounts</h2>
        <p className="mt-2 text-sm text-slate-400">Add at least one account. For testing, one handle is enough.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="tiktokHandle">TikTok handle</label>
            <input id="tiktokHandle" name="tiktokHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="@username" />
            <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="tiktokFollowers">Followers</label>
            <input id="tiktokFollowers" name="tiktokFollowers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="0" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="instagramHandle">Instagram handle</label>
            <input id="instagramHandle" name="instagramHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="@username" />
            <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="instagramFollowers">Followers</label>
            <input id="instagramFollowers" name="instagramFollowers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="0" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="youtubeHandle">YouTube handle</label>
            <input id="youtubeHandle" name="youtubeHandle" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="@channel" />
            <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="youtubeSubscribers">Subscribers</label>
            <input id="youtubeSubscribers" name="youtubeSubscribers" type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-700 p-4 text-slate-950" placeholder="0" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black text-white">Niches</h2>
        <p className="mt-2 text-sm text-slate-400">Crypto is selected by default so you can see the sample campaign.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {niches.map(([value, label]) => {
            const checked = selectedNiches.includes(value);
            return (
              <button
                type="button"
                key={value}
                onClick={() => toggleNiche(value)}
                className={`rounded-2xl border p-4 text-left text-sm font-bold ${checked ? "border-emerald-300 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-black/25 text-slate-200"}`}
              >
                {checked ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={loading || !userId} className="mt-8 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-black shadow-lg shadow-emerald-950/30 disabled:opacity-50 md:w-auto">
        {loading ? "Saving..." : "Save profile and unlock campaigns"}
      </button>
    </form>
  );
}
