export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getUserId(): string {
  if (typeof window !== "undefined") {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;

    if (userId) return String(userId);
  }

  const cookieKey = "cb_session";
  let sid = getCookie(cookieKey);

  if (!sid) {
    sid = crypto.randomUUID();
    setCookie(cookieKey, sid, 365);
  }

  return sid;
}
