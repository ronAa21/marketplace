import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

function buildHref(category?: string, q?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function CategoryTabs({
  active,
  q,
}: {
  active?: string;
  q?: string;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-2">
        <Link
          href={buildHref(undefined, q)}
          className={cn(
            "inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-colors",
            !active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-[#e4e6eb]",
          )}
        >
          All
        </Link>

        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={buildHref(category, q)}
            className={cn(
              "inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-colors",
              active === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-[#e4e6eb]",
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}
