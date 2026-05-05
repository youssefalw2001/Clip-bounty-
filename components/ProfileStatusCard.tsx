"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getUserId } from "@/lib/identity";

function shortId(value: string) {
  if (!value) return "Not loaded";
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function ProfileStatusCard() {
  const [userId, setUserId] = useState("");
  const [telegramId, setTelegramId] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const tid = tg?.initDataUnsafe?.user?.id;
    if (tid) setTelegramId(String(tid));
    setUserId(getUserId());
  }, []);

  const mode = useMemo(() => (telegramId ? "Telegram connected" : "Browser test mode"), [telegramId]);

  return (
    <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-2xl shadow-black/25">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Profile status</p>
          <h2 className="mt-2 text-2xl font-black text-white">{mode}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-100/80">
            Signed in as: <span className="font-black">{shortId(userId)}</span>
          </p>
          {!telegramId ? (
            <p className="mt-2 text-sm leading-6 text-amber-100">
              You are using a temporary browser identity. For worker notifications and future payouts, connect Telegram later.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/worker/profile" className="rounded-2xl bg-emerald-300 px-4 py-3 text-center text-sm font-black text-black">
            Complete Profile
          </Link>
          <Link href="/worker/campaigns" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-stone-200">
            View Campaigns
          </Link>
        </div>
      </div>
    </section>
  );
}
