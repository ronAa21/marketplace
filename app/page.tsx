import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { CategorySidebar } from "@/components/category-sidebar";
import { CategoryTabs } from "@/components/category-tabs";
import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import type { Listing } from "@/lib/types";

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q: rawQ, category } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (q) {
    // PostgREST's `or` filter is comma separated, so strip its delimiters.
    const safe = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  const listings = (data ?? []) as Listing[];
  const setupIssue =
    !!error &&
    /could not find the table|schema cache|relation .* does not exist/i.test(
      error.message,
    );

  const heading = q
    ? `Results for “${q}”`
    : category
      ? category
      : "Today's picks";

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-3 pb-16 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          {/* Fixed rail: pinned to the viewport below the sticky header. */}
          <div className="fixed top-[106px] h-[calc(100dvh-106px)] w-[260px] overflow-y-auto pt-6 pb-10 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategorySidebar active={category} q={q || undefined} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-balance">
              {heading}
            </h1>

            {q || category ? (
              <Link
                href="/"
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          <div className="mt-3 lg:hidden">
            <CategoryTabs active={category} q={q || undefined} />
          </div>

          <div className="mt-5">
            {error ? (
              setupIssue ? (
                <SetupNotice error={error.message} />
              ) : (
                <div className="rounded-xl bg-white p-6 text-sm text-destructive ring-1 ring-black/5">
                  Could not load listings: {error.message}
                </div>
              )
            ) : listings.length === 0 ? (
              <EmptyState
                title={q || category ? "No matches found" : "No listings yet"}
                description={
                  q || category
                    ? "Try a different search term or browse another category."
                    : "Be the first to post something. It only takes a minute."
                }
                actionLabel={
                  q || category ? "Browse everything" : "Create new listing"
                }
                actionHref={q || category ? "/" : "/listings/new"}
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
