import { DashboardShell } from "@/components/DashboardShell";
import { WorkerProfileForm } from "@/components/WorkerProfileForm";

export const dynamic = "force-dynamic";

export default function WorkerProfilePage() {
  return (
    <DashboardShell
      title="Worker profile"
      subtitle="Complete this once to unlock matching campaigns. Crypto is selected by default so the sample campaign is easy to test."
    >
      <WorkerProfileForm />
    </DashboardShell>
  );
}
