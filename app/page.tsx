import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";

export default function HomePage() {
  return (
    <DashboardShell
      title="Launch clip reward campaigns fast"
      subtitle="ClipBounty is a Telegram Mini App marketplace where buyers fund short-form campaigns and workers earn from verified clip performance."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/buyer/campaigns/new" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400">
          <p className="text-sm text-emerald-400">For buyers</p>
          <h2 className="mt-2 text-2xl font-bold">Create a campaign</h2>
          <p className="mt-3 text-sm text-slate-300">Fund clipping tasks for streamers, podcasts, digital products, or communities.</p>
        </Link>
        <Link href="/worker/campaigns" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400">
          <p className="text-sm text-emerald-400">For workers</p>
          <h2 className="mt-2 text-2xl font-bold">Find clip bounties</h2>
          <p className="mt-3 text-sm text-slate-300">Pick campaigns, post clips, submit links, and earn after review.</p>
        </Link>
        <Link href="/admin/clips" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400">
          <p className="text-sm text-emerald-400">For admin</p>
          <h2 className="mt-2 text-2xl font-bold">Review submissions</h2>
          <p className="mt-3 text-sm text-slate-300">Approve clips, monitor fraud risk, and prepare payout queues.</p>
        </Link>
      </div>
      <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
        <h3 className="text-xl font-bold">MVP focus</h3>
        <p className="mt-2 text-slate-300">
          This first version is intentionally semi-automated: manual TikTok/Instagram review, YouTube tracking later, and manual payout queue first.
        </p>
      </div>
    </DashboardShell>
  );
}
