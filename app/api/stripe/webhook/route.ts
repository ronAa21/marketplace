import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/utils/supabase/stateless";

export const runtime = "nodejs";

/** Shared sandbox: anything we don't recognise is acknowledged, not retried. */
function ignore(reason: string) {
  return NextResponse.json({ received: true, ignored: reason });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return ignore("unhandled-event");
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return ignore("unpaid");
  }

  if (!session.amount_total) {
    return ignore("missing-amount");
  }

  const listingId = session.metadata?.listing_id;

  if (!listingId) {
    return ignore("no-listing");
  }

  let supabase: SupabaseClient;

  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error("Supabase service client is not configured:", error);
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 },
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_email, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    console.error("Could not load the listing:", listingError);
    return NextResponse.json(
      { error: "Could not load the listing." },
      { status: 500 },
    );
  }

  if (!listing) {
    return ignore("unknown-listing");
  }

  // Direct charges arrive with event.account set to the connected account.
  // Fall back to the listing's seller if the endpoint isn't a Connect one.
  const sellerQuery = supabase
    .from("sellers")
    .select("email, stripe_account_id");

  const { data: seller, error: sellerError } = event.account
    ? await sellerQuery.eq("stripe_account_id", event.account).maybeSingle()
    : await sellerQuery
        .eq("email", listing.seller_email.trim().toLowerCase())
        .maybeSingle();

  if (sellerError) {
    console.error("Could not load the seller:", sellerError);
    return NextResponse.json(
      { error: "Could not load the seller." },
      { status: 500 },
    );
  }

  if (!seller?.stripe_account_id) {
    return ignore("unknown-account");
  }

  if (
    seller.email.trim().toLowerCase() !==
    listing.seller_email.trim().toLowerCase()
  ) {
    return ignore("seller-mismatch");
  }

  if (listing.status === "sold") {
    return ignore("already-sold");
  }

  const amount = (session.amount_total ?? 0) / 100;
  const buyerEmail =
    session.customer_details?.email ?? session.customer_email ?? "";

  // Stripe may retry a delivery. If a previous attempt inserted the order but
  // failed to mark the listing sold, finish the job instead of duplicating it.
  const { data: existingOrder, error: orderLookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("listing_id", listing.id)
    .limit(1)
    .maybeSingle();

  if (orderLookupError) {
    console.error("Could not check existing orders:", orderLookupError);
    return NextResponse.json(
      { error: "Could not check orders." },
      { status: 500 },
    );
  }

  if (!existingOrder) {
    const { error: insertError } = await supabase.from("orders").insert({
      listing_id: listing.id,
      buyer_email: buyerEmail,
      amount,
    });

    if (insertError) {
      console.error("Could not save the order:", insertError);
      return NextResponse.json(
        { error: "Could not save the order." },
        { status: 500 },
      );
    }
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listing.id);

  if (updateError) {
    console.error("Could not mark the listing sold:", updateError);
    return NextResponse.json(
      { error: "Could not update the listing." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
