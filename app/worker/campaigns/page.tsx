import { DashboardShell } from "@/components/DashboardShell";
import { WorkerCampaignGate } from "@/components/WorkerCampaignGate";
import { getCampaignCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkerCampaignsPage() {
  const campaigns = await getCampaignCards();

  return (
    <DashboardShell
      title="Available clip bounties"
      subtitle="Complete your profile once, then see campaigns matched to your social accounts and selected niches."
    >
      <WorkerCampaignGate campaigns={campaigns} />
    </DashboardShell>
  );
}
