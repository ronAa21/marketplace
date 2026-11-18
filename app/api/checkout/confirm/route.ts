import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/utils/supabase/stateless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe sends the buyer here after a successful checkout. The session is
 * verified directly with Stripe and the listing is marked sold, so a purchase
 * is recorded even when no webhook endpoint is configured for the deployment.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const listingId = url.searchParams.get("listing_id");

  if (!sessionId || !listingId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const listingUrl = new URL(`/listings/${listingId}`, request.url);

  let supabase: SupabaseClient;

  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error("Supabase service client is not configured:", error);
    return NextResponse.redirect(listingUrl);
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_email, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("email, stripe_account_id")
    .eq("email", listing.seller_email.trim().toLowerCase())
    .maybeSingle();

  if (!seller?.stripe_account_id) {
    return NextResponse.redirect(listingUrl);
  }

  let session: Stripe.Checkout.Session;

  try {
    // Direct charges live on the seller's connected account.
    session = await getStripe().checkout.sessions.retrieve(
      sessionId,
      {},
      { stripeAccount: seller.stripe_account_id },
    );
  } catch (error) {
    console.error("Could not retrieve the checkout session:", error);
    return NextResponse.redirect(listingUrl);
  }

  if (
    session.payment_status !== "paid" ||
    session.metadata?.listing_id !== listing.id
  ) {
    return NextResponse.redirect(listingUrl);
  }

  const successUrl = new URL(listingUrl);
  successUrl.searchParams.set("checkout", "success");

  if (listing.status === "sold") {
    return NextResponse.redirect(successUrl);
  }

  const amount = (session.amount_total ?? 0) / 100;
  const buyerEmail =
    session.customer_details?.email ?? session.customer_email ?? "";

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("listing_id", listing.id)
    .limit(1)
    .maybeSingle();

  if (!existingOrder) {
    const { error: insertError } = await supabase.from("orders").insert({
      listing_id: listing.id,
      buyer_email: buyerEmail,
      amount,
    });

    if (insertError) {
      console.error("Could not save the order:", insertError);
      return NextResponse.redirect(listingUrl);
    }
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listing.id);

  if (updateError) {
    console.error("Could not mark the listing sold:", updateError);
  }

  return NextResponse.redirect(successUrl);
}
