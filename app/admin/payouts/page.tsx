import { DashboardShell } from "@/components/DashboardShell";
import { clips } from "@/lib/data";

export default function AdminPayoutsPage() {
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
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
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
                  <button className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">Mark paid</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
