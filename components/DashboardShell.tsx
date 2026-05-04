import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/admin/import", label: "Import" },
  { href: "/worker/profile", label: "Profile" },
  { href: "/worker/campaigns", label: "Rewards" },
  { href: "/worker/submit", label: "Submit" },
  { href: "/admin/clips", label: "Review" },
  { href: "/admin/payouts", label: "Payouts" },
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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-stone-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.13),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.035),_transparent_38%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <nav className="relative z-10 border-b border-white/10 bg-black/45 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-sm font-black text-emerald-300 shadow-lg shadow-emerald-950/40">
              CB
            </span>
            <span className="text-lg font-black tracking-tight">
              Clip<span className="text-emerald-300">Bounty</span>
            </span>
          </Link>
          <Link href="/admin/import" className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-200 shadow-lg shadow-amber-950/20">
            Import
          </Link>
        </div>
        <div className="mx-auto mt-4 flex max-w-6xl gap-2 overflow-x-auto pb-1 text-sm text-stone-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="mb-9 max-w-4xl">
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
    </main>
  );
}
