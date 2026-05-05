import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { ProfileStatusCard } from "@/components/ProfileStatusCard";

const workerActions = [
  {
    title: "Find campaigns",
    description: "Browse available clipping rewards and pick a campaign that matches your niche.",
    href: "/worker/campaigns",
    cta: "Open campaigns",
  },
  {
    title: "Submit a clip",
    description: "Paste your public TikTok, Reels, or YouTube Shorts link after posting.",
    href: "/worker/submit",
    cta: "Submit clip",
  },
  {
    title: "Track earnings",
    description: "See submitted clips, approved clips, and payout progress.",
    href: "/worker/earnings",
    cta: "View earnings",
  },
  {
    title: "Complete profile",
    description: "Set your wallet, country, social accounts, and niches to unlock matching campaigns.",
    href: "/worker/profile",
    cta: "Open profile",
  },
];

const adminActions = [
  {
    title: "Import campaigns",
    description: "Add Reach.cat, Whop, Vyro, or manual campaigns for workers.",
    href: "/admin/import",
    cta: "Import",
  },
  {
    title: "Source submission queue",
    description: "Copy worker clip links, submit them into Whop/Reach.cat, and track source status.",
    href: "/admin/source-submissions",
    cta: "Open queue",
  },
  {
    title: "Review clips",
    description: "Approve or reject worker submissions before payout.",
    href: "/admin/clips",
    cta: "Review",
  },
  {
    title: "Payout queue",
    description: "Manage manual beta payouts before automatic TON transfers are added.",
    href: "/admin/payouts",
    cta: "Payouts",
  },
];

function ActionGrid({ title, subtitle, items }: { title: string; subtitle: string; items: typeof workerActions }) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">{title}</p>
        <p className="mt-2 text-sm leading-6 text-stone-400">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25 transition hover:-translate-y-1 hover:border-emerald-300/35">
            <h2 className="text-2xl font-black text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">{item.description}</p>
            <span className="mt-5 inline-flex rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-black">
              {item.cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AppHomePage() {
  return (
    <DashboardShell
      title="ClipBounty app"
      subtitle="Start here. Workers use the top section. Admins use the operator tools below."
    >
      <ProfileStatusCard />
      <ActionGrid title="Worker app" subtitle="The simple worker flow: profile, campaigns, submit, earnings." items={workerActions} />
      <ActionGrid title="Admin tools" subtitle="Use these when importing campaigns, submitting worker clips to the source platform, reviewing clips, or paying workers." items={adminActions} />
    </DashboardShell>
  );
}
