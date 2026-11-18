"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe";
import { isEmail } from "@/lib/format";
import {
  PROFILE_COOKIE,
  getProfileEmail,
  profileCookieOptions,
} from "@/lib/session";
import { createStatelessClient } from "@/utils/supabase/stateless";

export type OnboardingState = { error?: string };

async function beginOnboarding(email: string): Promise<OnboardingState> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env.local.",
    };
  }

  const supabase = createStatelessClient();

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("email, stripe_account_id")
    .eq("email", email)
    .maybeSingle();

  if (sellerError) {
    console.error("Could not load the seller:", sellerError);
    return { error: "Could not start onboarding. Please try again." };
  }

  let accountId = seller?.stripe_account_id ?? null;
  let url: string;

  try {
    const stripe = getStripe();

    if (!accountId) {
      // Accounts v2: this platform is on managed risk, so v1 `type: "express"`
      // is rejected. A full dashboard is the supported hosted-onboarding path.
      const account = await stripe.v2.core.accounts.create({
        contact_email: email,
        dashboard: "full",
        identity: {
          country: process.env.STRIPE_ACCOUNT_COUNTRY?.trim() || "US",
        },
        configuration: {
          merchant: {
            capabilities: { card_payments: { requested: true } },
          },
        },
        defaults: {
          responsibilities: {
            fees_collector: "stripe",
            losses_collector: "stripe",
          },
        },
      } as Parameters<typeof stripe.v2.core.accounts.create>[0]);

      accountId = account.id;

      // Save immediately so a return trip (or a refreshed tab) finds the account.
      const { error: saveError } = await supabase
        .from("sellers")
        .upsert(
          { email, stripe_account_id: accountId },
          { onConflict: "email" },
        );

      if (saveError) {
        console.error("Could not save the seller:", saveError);
        return { error: "Could not save your Stripe account. Please try again." };
      }
    }

    const base = await getSiteUrl();

    const link = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          refresh_url: `${base}/onboarding?refresh=1`,
          return_url: `${base}/onboarding/return?account=${accountId}`,
        },
      },
    });

    url = link.url;
  } catch (error) {
    console.error("Could not create the onboarding link:", error);
    return {
      error: "Could not reach Stripe. Check the server's Stripe keys and try again.",
    };
  }

  redirect(url);
}

export async function createOnboardingLink(
  _previous: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  // Remember this email so the profile page opens on the same seller.
  const store = await cookies();
  store.set(PROFILE_COOKIE, email, profileCookieOptions());

  return beginOnboarding(email);
}

/** Starts (or resumes) payout onboarding for the profile in this browser. */
export async function startOnboarding(): Promise<OnboardingState> {
  const email = await getProfileEmail();

  if (!email) {
    return { error: "Open your profile before connecting payouts." };
  }

  return beginOnboarding(email);
}
