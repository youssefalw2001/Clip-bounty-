import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { getCampaignCards } from "@/lib/queries";

export default async function BuyerCampaignsPage() {
  const campaigns = await getCampaignCards();

  return (
    <DashboardShell
      title="Buyer campaigns"
      subtitle="Create campaigns, review remaining budget, and monitor worker submissions. Copy a campaign UUID when testing worker submissions."
    >
      <div className="mb-6">
        <Link href="/buyer/campaigns/new" className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Create campaign
        </Link>
      </div>
      <div className="grid gap-5">
        {campaigns.map((campaign) => (
          <section key={campaign.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-400">{campaign.platform}</p>
                <h2 className="mt-1 text-2xl font-bold">{campaign.title}</h2>
                <p className="mt-2 text-slate-300">{campaign.description}</p>
                <p className="mt-3 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-slate-400">Campaign UUID: {campaign.id}</p>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 text-right">
                <p className="text-sm text-slate-400">Remaining</p>
                <p className="text-2xl font-black">${campaign.remainingBudget}</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              {campaign.rules.map((rule) => (
                <li key={rule} className="rounded-xl bg-slate-950 p-3">{rule}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
