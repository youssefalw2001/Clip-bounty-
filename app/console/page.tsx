import Link from "next/link";
import { AutoImportRunner } from "@/components/AutoImportRunner";
import { DashboardShell } from "@/components/DashboardShell";

const sections = [
  {
    title: "Import campaigns",
    description: "Paste a public source URL, fetch a draft, review filters, and import qualifying campaigns.",
    href: "/admin/import",
    cta: "Open importer",
  },
  {
    title: "Worker profile",
    description: "Create the worker profile required before campaigns unlock.",
    href: "/worker/profile",
    cta: "Set up profile",
  },
  {
    title: "Worker rewards",
    description: "View matched campaigns, source badges, budget remaining, approval rate, and payout per 1K views.",
    href: "/worker/campaigns",
    cta: "View rewards",
  },
  {
    title: "Submit clip",
    description: "Submit a posted TikTok, Reel, or YouTube Shorts link for review.",
    href: "/worker/submit",
    cta: "Submit clip",
  },
  {
    title: "Review clips",
    description: "Approve or reject submitted clips before they enter the payout queue.",
    href: "/admin/clips",
    cta: "Review queue",
  },
  {
    title: "Payout queue",
    description: "See approved unpaid clips and mark manual payouts as paid.",
    href: "/admin/payouts",
    cta: "Open payouts",
  },
  {
    title: "Worker earnings",
    description: "Check clip status, estimated earnings, and payout progress.",
    href: "/worker/earnings",
    cta: "View earnings",
  },
  {
    title: "Buyer campaigns",
    description: "View manually-created buyer campaigns and campaign UUIDs.",
    href: "/buyer/campaigns",
    cta: "Buyer desk",
  },
];

export default function ConsolePage() {
  return (
    <DashboardShell
      title="ClipBounty app console"
      subtitle="Use these buttons to test the full MVP flow on mobile: import, profile, claim, submit, review, payout."
    >
      <AutoImportRunner />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
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
    </DashboardShell>
  );
}
