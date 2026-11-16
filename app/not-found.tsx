import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="size-6" strokeWidth={1.6} />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">
        This listing is gone
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been sold or removed by the seller. Have a look at what else
        is available nearby.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 h-10 rounded-lg px-4 font-semibold",
        )}
      >
        Browse listings
      </Link>
    </div>
  );
}
