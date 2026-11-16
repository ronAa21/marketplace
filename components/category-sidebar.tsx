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

export function CategorySidebar({
  active,
  q,
}: {
  active?: string;
  q?: string;
}) {
  return (
    <nav aria-label="Categories">
      <h2 className="px-3 text-[17px] leading-5 font-bold">Categories</h2>

      <ul className="mt-4">
        <li>
          <Link
            href={buildHref(undefined, q)}
            className={cn(
              "block rounded-lg px-3 py-[7px] text-[15px] leading-5 transition-colors",
              !active
                ? "bg-accent font-semibold text-accent-foreground"
                : "hover:bg-muted",
            )}
          >
            All
          </Link>
        </li>

        {CATEGORIES.map((category) => (
          <li key={category}>
            <Link
              href={buildHref(category, q)}
              className={cn(
                "block rounded-lg px-3 py-[7px] text-[15px] leading-5 transition-colors",
                active === category
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "hover:bg-muted",
              )}
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
