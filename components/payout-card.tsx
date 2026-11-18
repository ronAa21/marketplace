"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOnboarding, type OnboardingState } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

const initialState: OnboardingState = {};

function maskAccount(accountId: string) {
  return `acct_…${accountId.slice(-4)}`;
}

export function PayoutCard({
  connected,
  accountId,
}: {
  connected: boolean;
  accountId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    () => startOnboarding(),
    initialState,
  );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            connected ? "bg-[#e6f7ec] text-[#0a7d33]" : "bg-accent text-primary",
          )}
        >
          {connected ? (
            <CheckCircle2 className="size-[22px]" strokeWidth={2} />
          ) : (
            <ShieldCheck className="size-[22px]" strokeWidth={2} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] leading-6 font-bold">
            {connected ? "Payouts connected" : "Get paid when your items sell"}
          </h2>
          <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">
            {connected
              ? "Buyers can check out with Buy Now. Money lands in your Stripe account, minus the 10% platform fee."
              : "Connect a Stripe account so buyers can check out instantly and payouts go straight to you."}
          </p>
          {connected && accountId ? (
            <p className="mt-1 font-mono text-[12px] text-muted-foreground">
              {maskAccount(accountId)}
            </p>
          ) : null}

          {state.error ? (
            <p
              role="alert"
              className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive"
            >
              {state.error}
            </p>
          ) : null}
        </div>

        <form action={formAction} className="shrink-0">
          <Button
            type="submit"
            variant={connected ? "outline" : "default"}
            disabled={pending}
            className="h-10 w-full gap-2 rounded-lg px-4 text-[14px] font-semibold sm:w-auto"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending
              ? "Opening Stripe…"
              : connected
                ? "Update payout details"
                : "Connect with Stripe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
