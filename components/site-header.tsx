import Link from "next/link";
import { Search, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="z-30 border-b border-black/5 bg-background lg:sticky lg:top-0">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/"
            className="group flex shrink-0 flex-col items-start gap-1.5"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-[1.04]">
              <Store className="size-[22px]" strokeWidth={2} />
            </span>
            <span className="text-[18px] leading-5 font-bold tracking-[-0.01em]">
              Marketplace
            </span>
          </Link>

          <div className="mt-1.5 flex flex-1 items-center justify-end gap-3">
            <form
              action="/"
              role="search"
              className="relative hidden w-full max-w-[350px] sm:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="Search Marketplace"
                aria-label="Search listings"
                className="h-10 w-full rounded-full border border-border bg-background pr-4 pl-11 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </form>

            <Link
              href="/listings/new"
              className={cn(
                buttonVariants(),
                "h-10 shrink-0 rounded-lg px-5 text-[15px] font-semibold",
              )}
            >
              Sell
            </Link>
          </div>
        </div>

        <div className="mt-3 w-full sm:hidden">
          <form action="/" role="search" className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search Marketplace"
              aria-label="Search listings"
              className="h-10 w-full rounded-full border border-border bg-background pr-4 pl-11 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
