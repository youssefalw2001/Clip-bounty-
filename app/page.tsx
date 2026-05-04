import Link from "next/link";

const caseStudies = [
  {
    type: "Trading indicator",
    name: "SignalFlow Pro",
    metric: "386K",
    label: "verified views in 9 days",
    spend: "$193 campaign spend",
    result: "1,940 landing visits",
    quote: "We had tried editors before. ClipBounty gave us volume, speed, and angles we never would have tested ourselves.",
    reach: ["New York", "Mumbai", "London", "Dubai"],
  },
  {
    type: "Course creator",
    name: "Creator OS Academy",
    metric: "214K",
    label: "verified views in 6 days",
    spend: "$107 campaign spend",
    result: "312 email opt-ins",
    quote: "The best part was not just the views. It was seeing which hooks actually made people stop scrolling.",
    reach: ["Los Angeles", "Delhi", "Toronto", "Singapore"],
  },
  {
    type: "Podcast",
    name: "The Founder Hour",
    metric: "492K",
    label: "verified views in 14 days",
    spend: "$246 campaign spend",
    result: "7 clips over 25K views",
    quote: "Our long episodes were sitting dead. Within a week, clips were bringing people back to the full show.",
    reach: ["Austin", "Bangalore", "Sydney", "Berlin"],
  },
  {
    type: "Streamer",
    name: "Northside Plays",
    metric: "168K",
    label: "verified views in 72 hours",
    spend: "$84 campaign spend",
    result: "1,120 profile visits",
    quote: "It felt like having a global clipping team without hiring one. The first clips went live while I was still streaming.",
    reach: ["Miami", "Kolkata", "Manila", "Manchester"],
  },
];

const comparisonRows = [
  ["ClipBounty", "$0.50", "$50 beta", "12-24 hours", "Pay per verified view"],
  ["US clipping agency", "$8-$25+", "$1,500+", "3-7 days", "Monthly retainer"],
  ["Whop rewards", "Variable", "$500+", "1-3 days", "Creator reward pool"],
  ["Vyro-style agency", "$3-$12+", "$1,000+", "2-5 days", "Managed campaign"],
];

const comparisonHeaders = ["Option", "Cost / 1K views", "Minimum budget", "Time to first clip", "Pay model"];

const pins = [
  "left-[21%] top-[38%]",
  "left-[48%] top-[42%]",
  "left-[61%] top-[50%]",
  "left-[72%] top-[45%]",
  "left-[55%] top-[33%]",
  "left-[80%] top-[68%]",
];

function WorldMapCard() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.16),_transparent_55%)]" />
      <div className="relative h-64 rounded-[1.5rem] border border-white/10 bg-black/40">
        <div className="absolute left-[8%] top-[30%] h-20 w-32 rounded-full border border-emerald-300/15 bg-emerald-300/[0.025] blur-[1px]" />
        <div className="absolute left-[39%] top-[24%] h-24 w-24 rounded-full border border-emerald-300/15 bg-emerald-300/[0.025] blur-[1px]" />
        <div className="absolute left-[57%] top-[37%] h-24 w-36 rounded-full border border-emerald-300/15 bg-emerald-300/[0.025] blur-[1px]" />
        <div className="absolute left-[72%] top-[58%] h-16 w-20 rounded-full border border-emerald-300/15 bg-emerald-300/[0.025] blur-[1px]" />
        {pins.map((pin, index) => (
          <span key={pin} className={`absolute ${pin} flex h-4 w-4 items-center justify-center`}>
            <span className="absolute h-6 w-6 animate-ping rounded-full bg-emerald-300/30" style={{ animationDelay: `${index * 220}ms` }} />
            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_22px_rgba(110,231,183,0.95)]" />
          </span>
        ))}
        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Global reach</p>
          <p className="mt-1 text-lg font-black text-white">Clips posted across 18+ markets</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.13),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.04),_transparent_42%)]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-sm font-black text-emerald-300 shadow-lg shadow-emerald-950/40">CB</span>
            <span className="text-xl font-black tracking-tight">Clip<span className="text-emerald-300">Bounty</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-semibold text-stone-300 md:flex">
            <a href="#advantage" className="hover:text-white">Advantage</a>
            <a href="#proof" className="hover:text-white">Proof</a>
            <a href="#compare" className="hover:text-white">Compare</a>
          </div>
          <Link href="/buyer/campaigns/new" className="rounded-full bg-emerald-300 px-5 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-emerald-950/40">Apply</Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_0.9fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,0.95)]" />
            10 new campaigns accepted monthly
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">
            Your content deserves an army.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300 md:text-xl">
            ClipBounty turns dead long-form content into a performance campaign. US creators fund verified-view bounties. A motivated global clipping network posts clips across TikTok, Reels, and Shorts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/buyer/campaigns/new" className="rounded-2xl bg-emerald-300 px-6 py-4 text-center font-black text-black shadow-2xl shadow-emerald-950/30">Apply for a campaign</Link>
            <Link href="/buyer/campaigns" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-bold text-white">View campaign desk</Link>
          </div>
          <p className="mt-5 text-sm text-stone-500">Creators pay $0.50 per 1,000 verified views. Clippers earn $0.30. You only pay when attention is proven.</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-red-300/10 bg-black/50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200/70">Before</p>
              <div className="mt-6 h-36 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="h-3 w-2/3 rounded-full bg-white/10" />
                <div className="mt-4 h-3 w-1/2 rounded-full bg-white/10" />
                <div className="mt-8 text-4xl font-black text-stone-700">217 views</div>
              </div>
              <p className="mt-4 text-sm text-stone-500">Great content. No distribution loop.</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/[0.07] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">After</p>
              <div className="mt-6 h-36 rounded-2xl border border-emerald-300/15 bg-black/40 p-4">
                <div className="h-3 w-5/6 rounded-full bg-emerald-300/25" />
                <div className="mt-4 h-3 w-2/3 rounded-full bg-emerald-300/20" />
                <div className="mt-8 animate-pulse text-4xl font-black text-emerald-200">386,420 views</div>
              </div>
              <p className="mt-4 text-sm text-stone-300">Volume, testing, and verified attention.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="advantage" className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">The global clipper advantage</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">Not cheaper. Hungrier, faster, and performance-aligned.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Hunger", "Emerging-market operators compete for performance, not fixed retainers."],
            ["Volume", "More angles, more hooks, more shots at a breakout clip."],
            ["Motivation", "Clippers win when buyers win. Every submission is tied to verified attention."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20">
              <h3 className="text-xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="proof" className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Proof snapshots</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">Campaigns built for measurable attention.</h2>
          </div>
          <p className="hidden max-w-sm text-sm text-stone-400 md:block">Fictional beta examples based on realistic early campaign ranges. Built to show the product story clearly.</p>
        </div>
        <div className="flex snap-x gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          {caseStudies.map((study) => (
            <article key={study.name} className="min-w-[82vw] snap-center rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 md:min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">{study.type}</p>
              <h3 className="mt-3 text-2xl font-black">{study.name}</h3>
              <p className="mt-5 text-5xl font-black tracking-tight text-white">{study.metric}</p>
              <p className="mt-1 text-sm text-stone-400">{study.label}</p>
              <div className="mt-5 grid gap-2 text-sm">
                <p className="rounded-2xl bg-black/35 p-3 text-stone-300">{study.spend}</p>
                <p className="rounded-2xl bg-black/35 p-3 text-stone-300">{study.result}</p>
              </div>
              <p className="mt-5 text-sm italic leading-6 text-stone-300">“{study.quote}”</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {study.reach.map((city) => (
                  <span key={city} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-300">{city}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <WorldMapCard />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Fund campaign", "Set your budget, platform, rules, and verified-view payout."],
            ["02", "Network goes to work", "Clippers test hooks, formats, and angles across short-form platforms."],
            ["03", "Pay verified views", "Manual review protects quality before payouts move forward."],
          ].map(([num, title, copy]) => (
            <div key={num} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/25">
              <p className="text-sm font-black text-emerald-200">{num}</p>
              <h3 className="mt-4 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-stone-300">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="compare" className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <h2 className="text-4xl font-black tracking-[-0.04em]">Built for campaigns, not retainers.</h2>
        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.06] text-stone-300">
              <tr>
                {comparisonHeaders.map((header) => (
                  <th key={header} className="p-5 font-black uppercase tracking-widest">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${cell}`} className={`p-5 ${index === 0 ? "font-black text-white" : "text-stone-300"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-3">
        {[
          ["Manual review", "Every clip can be checked before it becomes payable."],
          ["Budget control", "Campaign spend is capped by your funded budget and payout rules."],
          ["Verified creators", "Closed beta access protects buyers from low-quality spam."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.055] p-6">
            <h3 className="text-2xl font-black">{title}</h3>
            <p className="mt-3 leading-7 text-stone-300">{copy}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="rounded-[2.5rem] border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-white/[0.05] to-emerald-300/10 p-8 text-center shadow-2xl shadow-black/40 md:p-14">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Scarcity close</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl">Only 10 new campaigns accepted this month.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-300">We cap buyer intake so the network stays focused, payout review stays tight, and campaign quality stays high.</p>
          <Link href="/buyer/campaigns/new" className="mt-8 inline-flex rounded-2xl bg-emerald-300 px-7 py-4 font-black text-black shadow-2xl shadow-emerald-950/30">Apply for campaign access</Link>
        </div>
      </section>
    </main>
  );
}
