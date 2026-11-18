"use client";

import { useTransition } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/checkout";

export function BuyNowButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createCheckoutSession(listingId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      window.location.assign(result.url);
    });
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="h-11 w-full gap-2 rounded-lg text-[16px] font-semibold"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
        {pending ? "Starting checkout…" : "Buy Now"}
      </Button>
      <p className="mt-2 text-center text-[12px] text-muted-foreground">
        Secure checkout with Stripe
      </p>
    </div>
  );
}
