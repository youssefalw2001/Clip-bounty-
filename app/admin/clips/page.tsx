import Link from "next/link";
import { approveClipAction, rejectClipAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { getClipRows } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminClipsPage() {
  const clips = await getClipRows();

  return (
    <DashboardShell
      title="Admin clip review"
      subtitle="Review submitted clips, approve legitimate posts, reject bad submissions, and move approved milestones into payout review."
    >
      <div className="mb-6">
        <Link href="/admin/payouts" className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">
          Open payout queue
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="p-4">Clip ID</th>
              <th className="p-4">Worker</th>
              <th className="p-4">Platform</th>
              <th className="p-4">Views</th>
              <th className="p-4">Earnings</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clips.map((clip) => (
              <tr key={clip.id} className="border-t border-slate-800 bg-slate-950">
                <td className="p-4 font-mono text-xs">{clip.id}</td>
                <td className="p-4">{clip.worker}</td>
                <td className="p-4">{clip.platform}</td>
                <td className="p-4">{clip.views.toLocaleString()}</td>
                <td className="p-4">${clip.estimatedEarnings.toFixed(2)}</td>
                <td className="p-4">{clip.status}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <form action={approveClipAction}>
                      <input type="hidden" name="clipId" value={clip.id} />
                      <button className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">Approve</button>
                    </form>
                    <form action={rejectClipAction}>
                      <input type="hidden" name="clipId" value={clip.id} />
                      <button className="rounded-lg bg-red-400 px-3 py-2 text-xs font-bold text-slate-950">Reject</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
