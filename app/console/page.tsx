import Link from "next/link";
import { AutoImportRunner } from "@/components/AutoImportRunner";
import { DashboardShell } from "@/components/DashboardShell";

const adminSections = [
  {
    title: "1. Import campaigns",
    description: "Auto-import sample campaigns or paste a public source URL and review before publishing.",
    href: "/admin/import",
    cta: "Open importer",
  },
  {
    title: "5. Review clips",
    description: "Approve or reject submitted clips before they enter payouts.",
    href: "/admin/clips",
    cta: "Review queue",
  },
  {
    title: "6. Payout queue",
    description: "See approved unpaid clips and mark manual payouts as paid.",
    href: "/admin/payouts",
    cta: "Open payouts",
  },
];

const workerSections = [
  {
    title: "2. Worker profile",
    description: "Set wallet, country, social handles, and niches. Required before campaigns unlock.",
    href: "/worker/profile",
    cta: "Set up profile",
  },
  {
    title: "3. Worker campaigns",
    description: "View matched campaigns, payout per 1K views, budget remaining, and approval rate.",
    href: "/worker/campaigns",
    cta: "View campaigns",
  },
  {
    title: "4. Submit clip",
    description: "Submit a posted TikTok, Reel, or YouTube Shorts link for review.",
    href: "/worker/submit",
    cta: "Submit clip",
  },
  {
    title: "7. Earnings",
    description: "Check clip status, estimated earnings, and payout progress.",
    href: "/worker/earnings",
    cta: "View earnings",
  },
];

const buyerSections = [
  {
    title: "Buyer campaigns",
    description: "View manually-created buyer campaigns and campaign UUIDs.",
    href: "/buyer/campaigns",
    cta: "Buyer desk",
  },
  {
    title: "Create campaign",
    description: "Create a manual buyer-funded campaign for testing.",
    href: "/buyer/campaigns/new",
    cta: "Create campaign",
  },
];

function SectionGroup({ title, description, items }: { title: string; description: string; items: typeof adminSections }) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">{title}</p>
        <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25 transition hover:-translate-y-1 hover:border-emerald-300/35"
          >
            <h2 className="text-2xl font-black text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">{section.description}</p>
            <span className="mt-5 inline-flex rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-black">
              {section.cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ConsolePage() {
  return (
    <DashboardShell
      title="ClipBounty app console"
      subtitle="Everything is organized by role. Follow the numbered flow to test the full MVP: import, profile, claim, submit, review, payout."
    >
      <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
        <h2 className="text-2xl font-black text-white">Recommended test flow</h2>
        <p className="mt-3 text-sm leading-6">
          First run auto-import, then complete worker profile, open worker campaigns, submit a clip, review it as admin, then mark payout paid.
        </p>
      </div>

      <div className="mt-6">
        <AutoImportRunner />
      </div>

      <SectionGroup title="Admin tools" description="Use these to source campaigns, review work, and manage payouts." items={adminSections} />
      <SectionGroup title="Worker app" description="This is what clippers use to set up, claim campaigns, submit clips, and see earnings." items={workerSections} />
      <SectionGroup title="Buyer tools" description="Buyer pages are secondary right now because your current model imports outside campaigns." items={buyerSections} />
    </DashboardShell>
  );
}
