import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white px-6 py-16 text-center ring-1 ring-black/5">
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <PackageOpen className="size-6" strokeWidth={1.6} />
      </span>
      <h3 className="mt-4 text-[17px] font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-5 h-10 rounded-lg px-4 font-semibold",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
