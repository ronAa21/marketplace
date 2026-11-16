import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#e4e6eb]">
            <ImageIcon className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p className="text-[17px] font-bold leading-tight">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug">
          {listing.title}
        </p>
        {listing.location ? (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {listing.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
