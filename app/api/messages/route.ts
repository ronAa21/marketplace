import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendMessageNotification } from "@/lib/email";
import { isEmail } from "@/lib/format";

type Payload = {
  listing_id?: string;
  buyer_email?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const listingId = body.listing_id?.trim() ?? "";
  const buyerEmail = body.buyer_email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing." }, { status: 400 });
  }

  if (!isEmail(buyerEmail)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (message.length < 5) {
    return NextResponse.json(
      { error: "Your message is too short." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, seller_email")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 400 });
  }

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("messages").insert({
    listing_id: listing.id,
    buyer_email: buyerEmail,
    seller_email: listing.seller_email,
    message,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  const emailSent = await sendMessageNotification({
    to: listing.seller_email,
    buyerEmail,
    message,
    listingTitle: listing.title,
    listingUrl: `${origin}/listings/${listing.id}`,
  });

  return NextResponse.json({ ok: true, emailSent }, { status: 201 });
}
