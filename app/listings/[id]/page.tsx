import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { MessageSellerForm } from "@/components/message-seller-form";
import { SetupNotice } from "@/components/setup-notice";
import { displayNameFromEmail, formatPrice, timeAgo } from "@/lib/format";
import type { Listing } from "@/lib/types";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#e4e6eb]">
              <ImageIcon
                className="size-12 text-muted-foreground/50"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">
            {listing.title}
          </h1>

          <p className="mt-1 text-[24px] font-bold">
            {formatPrice(listing.price)}
          </p>

          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Listed {timeAgo(listing.created_at)}
            <br />
            in {listing.location || "Palo Alto, CA"}
          </p>

          {listing.description?.trim() ? (
            <section className="mt-6">
              <h2 className="text-[17px] font-bold">Description</h2>
              <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed">
                {listing.description}
              </p>
            </section>
          ) : null}

          <section className="mt-6">
            <h2 className="text-[17px] font-bold">Seller information</h2>
            <p className="mt-1 text-[15px]">
              {displayNameFromEmail(listing.seller_email)}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {listing.seller_email}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-[15px] font-bold">Send seller a message</h2>
            <MessageSellerForm
              listingId={listing.id}
              sellerEmail={listing.seller_email}
              listingTitle={listing.title}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
