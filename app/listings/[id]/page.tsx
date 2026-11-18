import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ListingGallery } from "@/components/listing-gallery";
import { MessageSellerForm } from "@/components/message-seller-form";
import { BuyNowButton } from "@/components/buy-now-button";
import { SetupNotice } from "@/components/setup-notice";
import { displayNameFromEmail, formatPrice, timeAgo } from "@/lib/format";
import type { Listing } from "@/lib/types";

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { id } = await params;
  const { checkout } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    const setupIssue =
      /could not find the table|schema cache|relation .* does not exist/i.test(
        error.message,
      );

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {setupIssue ? (
          <SetupNotice error={error.message} />
        ) : (
          <div className="rounded-xl bg-white p-6 text-sm text-destructive ring-1 ring-black/5">
            Could not load this listing: {error.message}
          </div>
        )}
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const listing = data as Listing;
  const sellerName = displayNameFromEmail(listing.seller_email);
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const images = listing.image_url ? [listing.image_url] : [];

  // A seller can only accept online payments after connecting Stripe. The
  // sellers table may not exist on a fresh install, so a failed lookup simply
  // means no Buy Now button.
  const { data: seller } = await supabase
    .from("sellers")
    .select("email, stripe_account_id")
    .eq("email", listing.seller_email.trim().toLowerCase())
    .maybeSingle();

  const isSold = listing.status === "sold";
  const sellerRegistered = Boolean(seller);
  const canBuy = !isSold && Boolean(seller?.stripe_account_id);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-3 pb-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
        Today&apos;s picks
      </Link>

      {checkout === "success" ? (
        <div className="mt-4 rounded-xl bg-[#e7f6ec] px-4 py-3 text-[14px] leading-relaxed text-[#12603a] ring-1 ring-[#12603a]/10">
          <strong className="font-semibold">Payment received.</strong> We&apos;re
          confirming your order — this listing is marked sold as soon as Stripe
          notifies us.
        </div>
      ) : checkout === "cancelled" ? (
        <div className="mt-4 rounded-xl bg-[#fff4e5] px-4 py-3 text-[14px] leading-relaxed text-[#8a4b00] ring-1 ring-[#8a4b00]/10">
          Checkout cancelled. You haven&apos;t been charged.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <ListingGallery images={images} title={listing.title} />
        </div>

        <aside className="min-w-0 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/5 lg:col-start-2 lg:row-start-1">
          <h1 className="text-[32px] leading-[1.15] font-bold tracking-[-0.02em] text-balance">
            {listing.title}
          </h1>

          <p className="mt-1.5 text-[30px] leading-tight font-bold">
            {formatPrice(listing.price)}
          </p>

          <p className="mt-2 text-[15px] leading-snug text-muted-foreground">
            Listed {timeAgo(listing.created_at)} in{" "}
            {listing.location || "Palo Alto, CA"}
          </p>

          {isSold ? (
            <div className="mt-4 rounded-lg bg-[#f0f2f5] px-4 py-3 text-center text-[15px] font-semibold">
              Sold
            </div>
          ) : canBuy ? (
            <div className="mt-4">
              <BuyNowButton listingId={listing.id} />
            </div>
          ) : sellerRegistered ? (
            <p className="mt-4 rounded-lg bg-[#f7f8fa] px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
              This seller hasn&apos;t connected payouts yet, so online checkout
              isn&apos;t available. Message them to arrange payment.
            </p>
          ) : null}

          <hr className="my-5 border-border" />

          <section>
            <h2 className="text-[13px] text-muted-foreground">
              Seller information
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-[17px] font-semibold text-primary">
                {sellerInitial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[17px] leading-tight font-semibold">
                  {sellerName}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {listing.seller_email}
                </p>
              </div>
            </div>
          </section>

          <hr className="my-5 border-border" />

          <section>
            <h2 className="text-[13px] text-muted-foreground">
              Send seller a message
            </h2>
            <MessageSellerForm
              listingId={listing.id}
              sellerEmail={listing.seller_email}
              listingTitle={listing.title}
            />
          </section>
        </aside>

        {listing.description?.trim() ? (
          <section className="min-w-0 max-w-[720px] lg:col-start-1 lg:row-start-2">
            <h2 className="text-[17px] font-bold">Description</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">
              {listing.description}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
