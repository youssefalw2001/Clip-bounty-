import { markClipPaidAction } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { getClipRows } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const clips = await getClipRows();
  const payable = clips.filter((clip) => clip.status === "approved" || clip.status === "payable");
  const total = payable.reduce((sum, clip) => sum + clip.estimatedEarnings, 0);

  return (
    <DashboardShell
      title="Payout queue"
      subtitle="Use this queue for manual beta payouts before automatic TON transfers are added."
    >
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">Pending payout estimate</p>
        <p className="mt-2 text-4xl font-black text-emerald-400">${total.toFixed(2)}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="p-4">Clip ID</th>
              <th className="p-4">Worker</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {payable.map((clip) => (
              <tr key={clip.id} className="border-t border-slate-800 bg-slate-950">
                <td className="p-4 font-mono text-xs">{clip.id}</td>
                <td className="p-4">{clip.worker}</td>
                <td className="p-4">${clip.estimatedEarnings.toFixed(2)}</td>
                <td className="p-4">manual review</td>
                <td className="p-4">
                  <form action={markClipPaidAction}>
                    <input type="hidden" name="clipId" value={clip.id} />
                    <button className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">Mark paid</button>
                  </form>
                </td>
              </tr>
            ))}
            {payable.length === 0 ? (
              <tr className="border-t border-slate-800 bg-slate-950">
                <td className="p-4 text-slate-400" colSpan={5}>No approved clips are ready for payout yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
