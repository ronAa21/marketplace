"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  setProfileEmail,
  type ProfileFormState,
} from "@/app/actions/profile";

const initialState: ProfileFormState = {};

export function ProfileEmailGate() {
  const [state, formAction, pending] = useActionState(
    setProfileEmail,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-3 pb-16 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
          <UserRound className="size-[22px]" strokeWidth={2} />
        </span>

        <h1 className="mt-4 text-[28px] leading-tight font-bold tracking-[-0.02em]">
          Open your profile
        </h1>

        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Enter the email you use on your listings to see your posts, messages
          and payout setup.
        </p>

        <form action={formAction} className="mt-6 space-y-3">
          <label
            htmlFor="profile-email"
            className="block text-[13px] font-semibold"
          >
            Email
          </label>

          <Input
            id="profile-email"
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
              <ArrowRight className="size-4" />
            )}
            {pending ? "Opening…" : "Continue"}
          </Button>
        </form>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
          This demo has no passwords. The email is stored in a cookie in this
          browser only.
        </p>
      </div>
    </div>
  );
}
