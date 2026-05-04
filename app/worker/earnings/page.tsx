import { DashboardShell } from "@/components/DashboardShell";
import { getClipRows } from "@/lib/queries";

export default async function WorkerEarningsPage() {
  const clips = await getClipRows();
  const total = clips.reduce((sum, clip) => sum + clip.estimatedEarnings, 0);

  return (
    <DashboardShell
      title="Worker earnings"
      subtitle="Track approved submissions, estimated earnings, and payout status."
    >
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">Estimated beta earnings</p>
        <p className="mt-2 text-4xl font-black text-emerald-400">${total.toFixed(2)}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="p-4">Clip ID</th>
              <th className="p-4">Campaign</th>
              <th className="p-4">Views</th>
              <th className="p-4">Earnings</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {clips.map((clip) => (
              <tr key={clip.id} className="border-t border-slate-800 bg-slate-950">
                <td className="p-4 font-mono text-xs">{clip.id}</td>
                <td className="p-4 font-mono text-xs">{clip.campaignId}</td>
                <td className="p-4">{clip.views.toLocaleString()}</td>
                <td className="p-4">${clip.estimatedEarnings.toFixed(2)}</td>
                <td className="p-4">{clip.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
