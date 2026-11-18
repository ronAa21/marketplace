import Link from "next/link";
import type Stripe from "stripe";
import { AlertCircle, CheckCircle2, ChevronLeft, Clock } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { createStatelessClient } from "@/utils/supabase/stateless";

export const metadata = {
  title: "Payout setup",
};

type LoadResult =
  | { ok: true; account: Stripe.V2.Core.Account; saved: boolean }
  | { ok: false };

async function loadAccount(accountId: string): Promise<LoadResult> {
  let account: Stripe.V2.Core.Account;

  try {
    account = await getStripe().v2.core.accounts.retrieve(accountId, {
      include: ["configuration.merchant", "identity", "requirements"],
    });
  } catch (error) {
    console.error("Could not load the Stripe account:", error);
    return { ok: false };
  }

  if (!account.contact_email) {
    return { ok: true, account, saved: false };
  }

  // Persist the account again on return, in case the row was removed while
  // the seller was inside Stripe's onboarding flow.
  try {
    const supabase = createStatelessClient();
    const { error } = await supabase
      .from("sellers")
      .upsert(
        {
          email: account.contact_email.trim().toLowerCase(),
          stripe_account_id: account.id,
        },
        { onConflict: "email" },
      );

    if (error) {
      console.error("Could not save the seller after onboarding:", error);
      return { ok: true, account, saved: false };
    }

    return { ok: true, account, saved: true };
  } catch (error) {
    console.error("Could not save the seller after onboarding:", error);
    return { ok: true, account, saved: false };
  }
}

export default async function OnboardingReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account: accountId } = await searchParams;

  if (!accountId) {
    return (
      <Shell
        tone="error"
        title="Missing Stripe account"
        description="We didn't get an account back from Stripe. Start onboarding again."
      />
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return (
      <Shell
        tone="error"
        title="Stripe isn't configured"
        description="Add STRIPE_SECRET_KEY to .env.local, then start onboarding again."
      />
    );
  }

  const result = await loadAccount(accountId);

  if (!result.ok) {
    return (
      <Shell
        tone="error"
        title="We couldn't find that Stripe account"
        description="The link may have expired. Start onboarding again with the same email."
      />
    );
  }

  const { account, saved } = result;
  const cardStatus =
    account.configuration?.merchant?.capabilities?.card_payments?.status;

  if (cardStatus === "active") {
    return (
      <Shell
        tone="success"
        title="You're ready to get paid"
        description={`Payouts are enabled for ${account.contact_email ?? "your account"}. New listings from this email can now be bought with Buy Now.`}
      />
    );
  }

  if (cardStatus === "pending") {
    return (
      <Shell
        tone="pending"
        title="Stripe is reviewing your details"
        description="Onboarding is complete. Stripe usually finishes verification shortly — buyers can pay you as soon as it clears."
      />
    );
  }

  if (cardStatus === "rejected" || cardStatus === "unsupported") {
    return (
      <Shell
        tone="error"
        title="Stripe couldn't approve this account"
        description="Start onboarding again with the same email, or contact Stripe support if the problem persists."
      />
    );
  }

  return (
    <Shell
      tone="pending"
      title="Onboarding isn't finished"
      description={
        saved
          ? "Your Stripe account was saved. Finish the remaining details to start receiving payouts."
          : "We couldn't save your Stripe account. Finish the remaining details, then start onboarding again with the same email."
      }
    />
  );
}

function Shell({
  tone,
  title,
  description,
}: {
  tone: "success" | "pending" | "error";
  title: string;
  description: string;
}) {
  const icon =
    tone === "success" ? (
      <CheckCircle2 className="size-[22px] text-primary" strokeWidth={2} />
    ) : tone === "pending" ? (
      <Clock className="size-[22px] text-[#8a4b00]" strokeWidth={2} />
    ) : (
      <AlertCircle className="size-[22px] text-destructive" strokeWidth={2} />
    );

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-3 pb-16 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
        Marketplace
      </Link>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-accent">
          {icon}
        </span>

        <h1 className="mt-4 text-[26px] leading-tight font-bold tracking-[-0.02em]">
          {title}
        </h1>

        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/listings/new"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-[14px] font-semibold text-primary-foreground hover:bg-primary/80"
          >
            Post a listing
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center rounded-lg px-4 text-[14px] font-semibold text-primary hover:underline"
          >
            Back to payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
