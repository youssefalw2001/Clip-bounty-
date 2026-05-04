import { AdminImportForm } from "@/components/AdminImportForm";
import { DashboardShell } from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <DashboardShell
      title="Import campaign"
      subtitle="Paste a public source URL to generate a draft, then review geo, budget, approval, and payout fields before importing."
    >
      <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
        Import rules: skip campaigns requiring US audience, skip campaigns under 40% budget remaining, and skip creators below 80% approval rate.
      </div>
      <AdminImportForm />
    </DashboardShell>
  );
}
