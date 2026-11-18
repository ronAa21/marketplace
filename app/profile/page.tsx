import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  MessageSquare,
  Plus,
} from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { PayoutCard } from "@/components/payout-card";
import { EditProfileDialog } from "@/components/profile-edit-dialog";
import { ProfileEmailGate } from "@/components/profile-email-gate";
import { displayNameFromEmail, initialsFrom, timeAgo } from "@/lib/format";
import { getProfileEmail } from "@/lib/session";
import type { Listing, Seller } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createStatelessClient } from "@/utils/supabase/stateless";

export const metadata = {
  title: "Profile",
};

type Tab = "listings" | "sold" | "messages";

type InboxMessage = {
  id: string;
  listing_id: string | null;
  buyer_email: string;
  message: string;
  created_at: string;
  listings: { title: string } | null;
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const email = await getProfileEmail();

  if (!email) {
    return <ProfileEmailGate />;
  }

  const { tab: rawTab } = await searchParams;
  const tab: Tab =
    rawTab === "sold" || rawTab === "messages" ? rawTab : "listings";

  let seller: Seller | null = null;
  let listings: Listing[] = [];
  let messages: InboxMessage[] = [];
  let messageCount = 0;
  let loadError: string | null = null;

  try {
    const supabase = createStatelessClient();

    const [sellerResult, listingsResult, messagesResult] = await Promise.all([
      supabase.from("sellers").select("*").eq("email", email).maybeSingle(),
      supabase
        .from("listings")
        .select("*")
        .eq("seller_email", email)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select(
          "id, listing_id, buyer_email, message, created_at, listings(title)",
          { count: "exact" },
        )
        .eq("seller_email", email)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    seller = (sellerResult.data as Seller | null) ?? null;
    listings = (listingsResult.data ?? []) as Listing[];
    messages = (messagesResult.data ?? []) as unknown as InboxMessage[];
    messageCount = messagesResult.count ?? messages.length;

    if (listingsResult.error) {
      loadError = listingsResult.error.message;
    }
  } catch (error) {
    console.error("Could not load the profile:", error);
    loadError = "Could not reach the database. Refresh to try again.";
  }

  const name = seller?.display_name?.trim() || displayNameFromEmail(email);
  const location = seller?.location?.trim() || null;
  const bio = seller?.bio?.trim() || null;
  const accountId = seller?.stripe_account_id ?? null;

  const active = listings.filter((listing) => listing.status !== "sold");
  const sold = listings.filter((listing) => listing.status === "sold");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "listings", label: "Listings", count: active.length },
    { key: "sold", label: "Sold", count: sold.length },
    { key: "messages", label: "Messages", count: messageCount },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-3 pb-16 sm:px-6">
      <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-20px_rgba(0,0,0,0.2)] ring-1 ring-black/5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-accent text-[26px] font-bold text-primary ring-2 ring-primary/20">
            {initialsFrom(name)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[26px] leading-tight font-bold tracking-[-0.02em]">
              {name}
            </h1>

            <p className="mt-1 flex items-center gap-1 text-[14px] text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {location ?? "Add your location"}
            </p>

            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {email}
            </p>
          </div>

          <EditProfileDialog
            email={email}
            name={seller?.display_name ?? null}
            location={seller?.location ?? null}
            bio={seller?.bio ?? null}
          />
        </div>

        {bio ? (
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            {bio}
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-3 divide-x divide-border rounded-xl bg-muted/70 py-3">
          <div className="px-3 sm:px-4">
            <dt className="text-[12px] font-medium text-muted-foreground">
              <span className="sm:hidden">Active</span>
              <span className="hidden sm:inline">Active listings</span>
            </dt>
            <dd className="text-[20px] leading-6 font-bold">{active.length}</dd>
          </div>
          <div className="px-3 sm:px-4">
            <dt className="text-[12px] font-medium text-muted-foreground">
              Sold
            </dt>
            <dd className="text-[20px] leading-6 font-bold">{sold.length}</dd>
          </div>
          <div className="px-3 sm:px-4">
            <dt className="text-[12px] font-medium text-muted-foreground">
              Messages
            </dt>
            <dd className="text-[20px] leading-6 font-bold">{messageCount}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-4">
        <PayoutCard connected={Boolean(accountId)} accountId={accountId} />
      </div>

      <nav className="mt-8 flex gap-6 border-b border-border">
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={item.key === "listings" ? "/profile" : `/profile?tab=${item.key}`}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-[15px] font-semibold transition-colors",
              tab === item.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[12px]",
                tab === item.key
                  ? "bg-accent text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {item.count}
            </span>
          </Link>
        ))}
      </nav>

      <div className="mt-5">
        {loadError ? (
          <p className="rounded-xl bg-white p-4 text-[14px] text-destructive ring-1 ring-black/5">
            Could not load your listings: {loadError}
          </p>
        ) : tab === "messages" ? (
          messages.length === 0 ? (
            <EmptyNote
              icon={<MessageSquare className="size-6" strokeWidth={1.6} />}
              title="No messages yet"
              description="When a buyer messages you about a listing, it shows up here."
            />
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="rounded-xl bg-white p-4 ring-1 ring-black/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-[15px] font-semibold">
                      {message.listings?.title ?? "Listing removed"}
                    </p>
                    <p className="shrink-0 text-[12px] text-muted-foreground">
                      {timeAgo(message.created_at)}
                    </p>
                  </div>

                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    From {message.buyer_email}
                  </p>

                  <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>

                  {message.listing_id ? (
                    <Link
                      href={`/listings/${message.listing_id}`}
                      className="mt-2 inline-block text-[13px] font-semibold text-primary hover:underline"
                    >
                      View listing
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )
        ) : tab === "sold" ? (
          sold.length === 0 ? (
            <EmptyNote
              icon={<CheckCircle2 className="size-6" strokeWidth={1.6} />}
              title="Nothing sold yet"
              description="Items sold through Buy Now will be collected here."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {sold.map((listing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing} />
                  <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Sold
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {active.length === 0 ? (
              <p className="mb-4 text-[14px] text-muted-foreground">
                You have no active listings. Post one and it appears on the
                homepage right away.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/listings/new"
                className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white/60 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40 hover:text-primary"
              >
                <span className="grid size-11 place-items-center rounded-full bg-muted transition-colors group-hover:bg-white">
                  <Plus className="size-5" strokeWidth={2.2} />
                </span>
                <span className="text-[15px] font-semibold">Post a listing</span>
              </Link>

              {active.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyNote({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-8 text-center ring-1 ring-black/5">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <p className="mt-3 text-[16px] font-semibold">{title}</p>
      <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>
    </div>
  );
}
