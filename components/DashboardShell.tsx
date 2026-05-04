import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/worker/campaigns", label: "Worker" },
  { href: "/buyer/campaigns", label: "Buyer" },
  { href: "/admin/clips", label: "Admin" },
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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="border-b border-slate-800 bg-slate-950/80 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight">
            Clip<span className="text-emerald-400">Bounty</span>
          </Link>
          <div className="flex gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Telegram Mini App MVP
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
