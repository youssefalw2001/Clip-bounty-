"use client";

import { useEffect } from "react";

export function TelegramInitializer() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
  }, []);

  return null;
}
