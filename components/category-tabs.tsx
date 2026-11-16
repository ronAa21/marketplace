"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function buildHref(category?: string, q?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function chipClass(isActive: boolean) {
  return cn(
    "inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-foreground hover:bg-[#e4e6eb]",
  );
}

function rowClass(isActive: boolean) {
  return cn(
    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
    isActive
      ? "bg-accent font-semibold text-accent-foreground"
      : "hover:bg-muted",
  );
}

export function CategoryTabs({
  active,
  q,
}: {
  active?: string;
  q?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="-ml-4 min-w-0 flex-1 overflow-x-auto pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-2 pr-1">
          <Link href={buildHref(undefined, q)} className={chipClass(!active)}>
            All
          </Link>

          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={buildHref(category, q)}
              className={chipClass(active === category)}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          aria-label="Show all categories"
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            active
              ? "border-primary/30 bg-accent text-primary"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
        >
          <SlidersHorizontal className="size-4" strokeWidth={2} />
        </DialogTrigger>

        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold">
              Categories
            </DialogTitle>
            <DialogDescription>
              Pick a category to filter listings.
            </DialogDescription>
          </DialogHeader>

          <nav
            aria-label="All categories"
            className="-mx-1 max-h-[60vh] overflow-y-auto px-1"
          >
            <ul className="space-y-0.5">
              <li>
                <Link
                  href={buildHref(undefined, q)}
                  onClick={() => setOpen(false)}
                  className={rowClass(!active)}
                >
                  All
                  {!active ? <Check className="size-4" strokeWidth={2.5} /> : null}
                </Link>
              </li>

              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={buildHref(category, q)}
                    onClick={() => setOpen(false)}
                    className={rowClass(active === category)}
                  >
                    {category}
                    {active === category ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
