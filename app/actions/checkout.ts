"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe, PLATFORM_FEE_RATE } from "@/lib/stripe";
import { createStatelessClient } from "@/utils/supabase/stateless";

export type CheckoutResult = { url: string } | { error: string };

export async function createCheckoutSession(
  listingId: string,
): Promise<CheckoutResult> {
  const id = typeof listingId === "string" ? listingId.trim() : "";

  if (!id) {
    return { error: "Missing listing." };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env.local.",
    };
  }

  let supabase: SupabaseClient;

  try {
    supabase = createStatelessClient();
  } catch (error) {
    console.error("Supabase is not configured:", error);
    return { error: "The marketplace is not configured yet." };
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, price, image_url, seller_email, status")
    .eq("id", id)
    .maybeSingle();

  if (listingError) {
    console.error("Could not load the listing:", listingError);
    return { error: "Could not load this listing. Please try again." };
  }

  if (!listing) {
    return { error: "This listing no longer exists." };
  }

  if (listing.status !== "available") {
    return { error: "This item is no longer available." };
  }

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("email, stripe_account_id")
    .eq("email", listing.seller_email.trim().toLowerCase())
    .maybeSingle();

  if (sellerError) {
    console.error("Could not load the seller:", sellerError);
    return { error: "Could not load the seller. Please try again." };
  }

  if (!seller?.stripe_account_id) {
    return { error: "This seller hasn't connected payouts yet." };
  }

  const amountCents = Math.round(Number(listing.price) * 100);

  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return { error: "This listing can't be purchased online." };
  }

  const applicationFee = Math.round(amountCents * PLATFORM_FEE_RATE);

  try {
    const stripe = getStripe();
    const base = await getSiteUrl();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: listing.title,
                ...(listing.image_url ? { images: [listing.image_url] } : {}),
              },
            },
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFee,
        },
        success_url: `${base}/api/checkout/confirm?listing_id=${listing.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/listings/${listing.id}?checkout=cancelled`,
        metadata: { listing_id: listing.id },
      },
      // Direct charge: the payment is created on the seller's connected
      // account, with the platform fee collected via application_fee_amount.
      { stripeAccount: seller.stripe_account_id },
    );

    if (!session.url) {
      return { error: "Stripe did not return a checkout URL." };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Could not create the checkout session:", error);
    return {
      error: "Could not start checkout. Make sure the seller finished Stripe onboarding.",
    };
  }
}
