import { CampaignCard } from "@/components/CampaignCard";
import { DashboardShell } from "@/components/DashboardShell";
import { getCampaignCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkerCampaignsPage() {
  const campaigns = await getCampaignCards();

  return (
    <DashboardShell
      title="Available clip bounties"
      subtitle="Workers can browse campaigns, follow buyer rules, post short-form clips, and submit links for review."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </DashboardShell>
  );
}
