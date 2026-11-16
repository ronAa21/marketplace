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
      <h2 className="text-[17px] font-bold">Categories</h2>

      <ul className="mt-2.5 space-y-0.5">
        <li>
          <Link
            href={buildHref(undefined, q)}
            className={cn(
              "block rounded-lg px-2 py-1.5 text-[15px] leading-tight transition-colors",
              !active
                ? "bg-accent font-semibold text-accent-foreground"
                : "hover:bg-black/5",
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
                "block rounded-lg px-2 py-1.5 text-[15px] leading-tight transition-colors",
                active === category
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "hover:bg-black/5",
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
