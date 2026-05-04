# ClipBounty

A Telegram Mini App MVP for performance-based short-form clip campaigns.

Buyers create campaigns. Workers submit TikTok, YouTube Shorts, or Instagram Reels links. Admins review submissions and manage a manual payout queue during beta.

## MVP scope

This repo starts intentionally simple:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Postgres schema
- Demo buyer, worker, and admin pages
- Telegram init data helper
- Basic YouTube link parsing and fraud scoring helpers

## Pages

- `/` - landing dashboard
- `/worker/campaigns` - worker campaign feed
- `/worker/submit` - clip submission form
- `/worker/earnings` - worker earnings dashboard
- `/buyer/campaigns` - buyer campaign dashboard
- `/buyer/campaigns/new` - create campaign form
- `/admin/clips` - admin clip review
- `/admin/payouts` - manual payout queue

## Getting started

Install dependencies:

```bash
npm install
```

Create your env file:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Database

Set `DATABASE_URL` in `.env.local`, then generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Important beta strategy

Do not automate payouts on day one. Run the first version as a semi-automated agency backend:

1. Buyer creates campaign.
2. Worker submits clip link.
3. Admin manually reviews the clip.
4. Approved clips move toward payout queue.
5. Admin manually pays worker.
6. YouTube tracking, TikTok OAuth, Instagram API, and automatic TON payouts come later.

## Next build steps

- Wire campaign creation form to Postgres.
- Wire clip submission form to Postgres.
- Add Telegram Mini App auth route.
- Add admin approve/reject server actions.
- Add YouTube Data API view tracking.
- Add payout status updates.
- Deploy to Vercel.
