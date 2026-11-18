"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createOnboardingLink,
  type OnboardingState,
} from "@/app/actions/onboarding";

const initialState: OnboardingState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    createOnboardingLink,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <label
        htmlFor="onboarding-email"
        className="block text-[13px] font-semibold"
      >
        Email used on your listings
      </label>

      <Input
        id="onboarding-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="h-11 rounded-lg bg-white text-[15px]"
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2 rounded-lg text-[15px] font-semibold"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Lock className="size-4" />
        )}
        {pending ? "Opening Stripe…" : "Connect with Stripe"}
      </Button>

      <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
        You&apos;ll finish signup on Stripe. Marketplace takes a 10% fee on each
        sale; the rest is paid out to your Stripe account.
      </p>
    </form>
  );
}
