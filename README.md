# Marketplace

A local classifieds marketplace built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **shadcn/ui** and **Supabase**.

Browse listings in a responsive grid, search by title or description, filter by category, publish a listing with a photo, and message a seller — the message is stored in Supabase and emailed to the seller.

## Stack

| Layer    | Choice                                          |
| -------- | ----------------------------------------------- |
| Framework| Next.js 15 (App Router, Server Components)      |
| UI       | React 19, Tailwind CSS v4, shadcn/ui, lucide    |
| Data     | Supabase (Postgres, Storage, Row Level Security)|
| Email    | Resend (optional, used for seller notifications)|

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 1. Environment

`.env.local` is already set up with the project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

### 2. Database

Open the Supabase dashboard → **SQL Editor** and run, in order:

1. `supabase/schema.sql` — tables, indexes, storage bucket, RLS policies and the `updated_at` trigger.
2. `supabase/seed.sql` *(optional)* — eight demo listings so the grid is not empty.

Both scripts are idempotent, so they can be re-run safely.

### 3. Email notifications (optional)

“Message seller” always saves the message to the `messages` table. To also email the seller:

1. Create an API key at [resend.com](https://resend.com).
2. Add it to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=Marketplace <onboarding@resend.dev>
```

Without a key the app keeps working — the buyer just sees that the message was saved. With `onboarding@resend.dev` as the sender, Resend only delivers to the account owner's address until you verify a domain.

## Features

- **Create listing** — photo upload to the `listing-images` bucket, title, description, price, category, seller email and location. Validated on the client and again in `POST /api/listings`.
- **Browse & search** — server-rendered 5-column grid, category sidebar (chips on mobile), `ilike` search over title/description, empty and setup states.
- **Listing detail** — dedicated `/listings/[id]` page with the image, price, description, seller information and the message box.
- **Message seller** — inline form → `POST /api/messages` → row in `messages` + Resend email to the seller with `reply-to` set to the buyer.

## Project structure

```
app/
  page.tsx                  Browse, search and category filtering
  listings/new/page.tsx     Post a listing
  listings/[id]/page.tsx    Listing detail
  api/listings/route.ts     Create listing (server-side validation)
  api/messages/route.ts     Save message + notify seller
components/
  site-header.tsx
  category-sidebar.tsx, category-tabs.tsx
  listing-card.tsx, empty-state.tsx
  listing-form.tsx, message-seller-form.tsx
  ui/                       shadcn/ui primitives
lib/
  categories.ts, format.ts, types.ts, email.ts
utils/supabase/
  client.ts, server.ts, middleware.ts
middleware.ts               Keeps Supabase sessions refreshed
supabase/
  schema.sql, seed.sql
```

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Security notes

RLS is enabled on both tables. Listings and messages are publicly readable and insertable (no auth in this app), while updates to a listing are limited to the seller's own JWT email. Storage policies only allow inserts and reads inside the `listing-images` bucket.
