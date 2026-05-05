import { DashboardShell } from "@/components/DashboardShell";
import { WorkerSubmitFlow } from "@/components/WorkerSubmitFlow";

export const dynamic = "force-dynamic";

export default function SubmitClipPage({
  searchParams,
}: {
  searchParams?: { campaignId?: string; campaignTitle?: string };
}) {
  const campaignId = searchParams?.campaignId || "";
  const campaignTitle = searchParams?.campaignTitle || "Selected campaign";

  return (
    <DashboardShell
      title="Submit your clip"
      subtitle="Follow the steps, post publicly, start the 60-minute timer, then submit your clip URL for review."
    >
      <WorkerSubmitFlow campaignId={campaignId} campaignTitle={campaignTitle} />
    </DashboardShell>
  );
}
