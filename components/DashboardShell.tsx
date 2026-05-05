import Link from "next/link";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/app", label: "App Home" },
      { href: "/console", label: "Console" },
      { href: "/", label: "Landing" },
    ],
  },
  {
    label: "Worker",
    items: [
      { href: "/worker/campaigns", label: "Campaigns" },
      { href: "/worker/submit", label: "Submit" },
      { href: "/worker/earnings", label: "Earnings" },
      { href: "/worker/profile", label: "Profile" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/import", label: "Import" },
      { href: "/admin/source-submissions", label: "Source Queue" },
      { href: "/admin/clips", label: "Review" },
      { href: "/admin/payouts", label: "Payouts" },
    ],
  },
  {
    label: "Buyer",
    items: [
      { href: "/buyer/campaigns", label: "Campaigns" },
      { href: "/buyer/campaigns/new", label: "New" },
    ],
  },
];

export function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] pb-20 text-stone-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.13),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.035),_transparent_38%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/75 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/app" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-sm font-black text-emerald-300 shadow-lg shadow-emerald-950/40">
              CB
            </span>
            <span className="truncate text-xl font-black tracking-tight">
              Clip<span className="text-emerald-300">Bounty</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/app" className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-200 shadow-lg shadow-emerald-950/20">
              App
            </Link>
            <details className="relative">
              <summary className="list-none rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-200 [&::-webkit-details-marker]:hidden">
                Menu
              </summary>
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-white/10 bg-[#090909] p-4 shadow-2xl shadow-black/60">
                <div className="space-y-4">
                  {navGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-stone-500">{group.label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-stone-200 transition hover:bg-white/10 hover:text-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-8 max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
            Private beta network
          </div>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 md:text-lg">{subtitle}</p>
        </div>
        {children}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 text-center text-xs font-black text-stone-300">
          <Link href="/worker/campaigns" className="rounded-2xl bg-white/5 px-2 py-3">Campaigns</Link>
          <Link href="/worker/submit" className="rounded-2xl bg-white/5 px-2 py-3">Submit</Link>
          <Link href="/worker/earnings" className="rounded-2xl bg-white/5 px-2 py-3">Earnings</Link>
          <Link href="/worker/profile" className="rounded-2xl bg-white/5 px-2 py-3">Profile</Link>
        </div>
      </div>
    </main>
  );
}
