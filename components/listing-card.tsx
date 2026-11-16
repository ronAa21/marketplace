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
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#e4e6eb]">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImageIcon className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p className="text-[17px] leading-5 font-bold">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-1 line-clamp-2 text-[15px] leading-[1.3]">
          {listing.title}
        </p>
        {listing.location ? (
          <p className="mt-1 truncate text-[13px] leading-4 text-muted-foreground">
            {listing.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
