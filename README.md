# Marketplace

A local classifieds marketplace built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **shadcn/ui** and **Supabase**.

Browse listings in a responsive grid, search by title or description, filter by category, publish a listing with a photo, and message a seller — the message is stored in Supabase and emailed to the seller. Each browser also gets a profile keyed by the email on its listings, where sellers manage their posts, read messages and connect payouts.

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

1. `supabase/schema.sql` — tables (`listings`, `messages`, `sellers`, `orders`), indexes, storage bucket, RLS policies and the `updated_at` trigger.
2. `supabase/seed.sql` *(optional)* — eight demo listings so the grid is not empty.

Both scripts are idempotent, so they can be re-run safely. Re-run `schema.sql` after upgrading: it adds `sellers.display_name`, `sellers.bio` and `sellers.location`, which the profile page uses.

### 3. Email notifications (optional)

“Message seller” always saves the message to the `messages` table. To also email the seller:

1. Create an API key at [resend.com](https://resend.com).
2. Add it to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=Marketplace <onboarding@resend.dev>
```

Without a key the app keeps working — the buyer just sees that the message was saved. With `onboarding@resend.dev` as the sender, Resend only delivers to the account owner's address until you verify a domain.

### 4. Stripe Connect

Buying and payouts use Stripe Connect (Express accounts, direct charges). In `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx
STRIPE_ACCOUNT_COUNTRY=US
```

1. Sellers open **Profile → Connect with Stripe** (the same onboarding is still available at `/onboarding`), enter their listing email and finish Stripe's hosted signup. The account id is saved in `sellers` by email. Accounts are created with the Accounts v2 API (`dashboard: "full"`) because this platform is on managed risk, which rejects the legacy v1 `type: "express"` field. `STRIPE_ACCOUNT_COUNTRY` sets the connected account's country (default `US`).
2. Local webhooks: `stripe listen --forward-connect-to localhost:3000/api/stripe/webhook --events checkout.session.completed --events-from @accounts` and use the printed `whsec_…` as `STRIPE_WEBHOOK_SECRET`. Newer Stripe CLI versions require an explicit event list.
3. In the dashboard, create a **Connect** webhook pointed at `/api/stripe/webhook` and subscribe to `checkout.session.completed`. Direct-charge events live on the connected account, so a normal account webhook will not receive them.
4. `SUPABASE_SERVICE_ROLE_KEY` is only read by the webhook: RLS does not let an anonymous client mark a listing sold.

## Features

- **Create listing** — photo upload to the `listing-images` bucket, title, description, price, category, seller email and location. Validated on the client and again in `POST /api/listings`, which also registers the seller's email in `sellers` (existing rows keep their Stripe account id). New listings start with `status = 'available'`.
- **Browse & search** — server-rendered 5-column grid, category sidebar (chips on mobile), `ilike` search over title/description, empty and setup states.
- **Listing detail** — dedicated `/listings/[id]` page with the image, price, description, seller information and the message box.
- **Message seller** — inline form → `sendSellerMessage` Server Action → row in `messages` + Resend email to the seller with `reply-to` set to the buyer.
- **Seller onboarding** — `/onboarding` or the profile payout card creates (or reuses) a connected account and redirects to Stripe. The return page saves the account id and email to `sellers` and reports whether payouts are enabled.
- **Profile** — the avatar in the header opens a menu with the seller's name, location, **View profile**, **My listings**, **Messages** and **Sign out**. `/profile` shows the profile card, listing/sold/message counts, the embedded Stripe payout card, tabs for active listings, sold items and the message inbox, and an edit dialog for name, location and bio.
- **Buy Now** — shown when the listing's seller has a connected account. Creates a Checkout Session as a direct charge (`stripeAccount`) with a 10% `application_fee_amount`.
- **Stripe webhook** — verifies `STRIPE_WEBHOOK_SECRET`, and on `checkout.session.completed` inserts an order and sets the listing to `sold`. Unknown listings, accounts and duplicate deliveries return `200`.

## Project structure

```
app/
  page.tsx                  Browse, search and category filtering
  listings/new/page.tsx     Post a listing
  listings/[id]/page.tsx    Listing detail (Buy Now when the seller is connected)
  onboarding/page.tsx       Seller payout onboarding
  onboarding/return/page.tsx  Saves the Stripe account after onboarding
  profile/page.tsx          Profile, listings, sold items and message inbox
  api/listings/route.ts     Create listing (server-side validation)
  api/stripe/webhook/route.ts  Stripe webhook: order + mark sold
  actions/messages.ts       Server Action: save message + email seller
  actions/onboarding.ts     Server Action: connected account + account link
  actions/checkout.ts       Server Action: direct-charge Checkout Session
  actions/profile.ts        Server Actions: open, edit and leave a profile
components/
  site-header.tsx, profile-menu.tsx
  category-sidebar.tsx, category-tabs.tsx
  listing-card.tsx, empty-state.tsx
  listing-form.tsx, message-seller-form.tsx
  onboarding-form.tsx, buy-now-button.tsx
  profile-email-gate.tsx, profile-edit-dialog.tsx, payout-card.tsx
  ui/                       shadcn/ui primitives
lib/
  categories.ts, format.ts, types.ts, stripe.ts, site-url.ts, session.ts
utils/supabase/
  client.ts, server.ts, stateless.ts, middleware.ts
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

RLS is enabled on all four tables. Listings, messages and sellers are publicly readable and insertable (no auth in this app), while updates to a listing are limited to the seller's own JWT email. Orders accept inserts but are not publicly readable because they hold buyer emails — read them with the service-role key. The open `sellers` update policy is demo-only; lock it down before sellers can sign in, since it controls the payout account. Storage policies only allow inserts and reads inside the `listing-images` bucket.

The profile is identified by a `marketplace_email` cookie, set when a listing is posted or a profile is opened. It is a convenience identity, not authentication: anyone who types an email opens that profile. Add real auth before exposing seller-only data.
