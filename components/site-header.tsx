import Link from "next/link";
import { Search, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] items-start justify-between gap-4">
        <Link href="/" className="group flex shrink-0 flex-col items-start gap-1">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Store className="size-5" strokeWidth={2} />
          </span>
          <span className="text-[17px] leading-none font-bold tracking-tight">
            Marketplace
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <form
            action="/"
            role="search"
            className="relative hidden w-full max-w-[280px] sm:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search Marketplace"
              aria-label="Search listings"
              className="h-9 w-full rounded-full border border-transparent bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <Link
            href="/listings/new"
            className={cn(
              buttonVariants(),
              "h-9 rounded-lg px-4 text-sm font-semibold",
            )}
          >
            Sell
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[1500px] sm:hidden">
        <form action="/" role="search" className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search Marketplace"
            aria-label="Search listings"
            className="h-10 w-full rounded-full border border-transparent bg-white pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </div>
    </header>
  );
}
