"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const selected = images[active] ?? null;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#e4e6eb]">
        {selected ? (
          <Image
            src={selected}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImageIcon
              className="size-12 text-muted-foreground/50"
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View photo ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={cn(
                "relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-[#e4e6eb] transition-shadow",
                index === active
                  ? "ring-2 ring-primary"
                  : "ring-1 ring-black/5 hover:ring-black/20",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="88px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
