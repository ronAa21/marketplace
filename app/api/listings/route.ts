import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { CATEGORY_LABELS } from "@/lib/categories";
import { isEmail } from "@/lib/format";
import { PROFILE_COOKIE, profileCookieOptions } from "@/lib/session";

type Payload = {
  title?: string;
  price?: number | string;
  category?: string;
  description?: string | null;
  seller_email?: string;
  location?: string | null;
  image_url?: string | null;
};

export async function POST(request: Request) {
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = body.title?.trim() ?? "";
  const price = Number(body.price);
  const category = body.category?.trim() ?? "";
  const sellerEmail = body.seller_email?.trim().toLowerCase() ?? "";
  const description = body.description?.trim() || null;
  const location = body.location?.trim() || "Palo Alto, CA";
  const imageUrl = body.image_url?.trim() || null;

  if (title.length < 3) {
    return NextResponse.json(
      { error: "Title must be at least 3 characters." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }

  if (!CATEGORY_LABELS.includes(category)) {
    return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
  }

  if (!isEmail(sellerEmail)) {
    return NextResponse.json(
      { error: "Enter a valid seller email." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("listings")
    .insert({
      title,
      price,
      category,
      description,
      seller_email: sellerEmail,
      location,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Register the seller by email so Stripe Connect onboarding has a row to
  // attach to. Existing rows are left untouched (their stripe_account_id is
  // preserved), and a failure here must not block the listing.
  try {
    const { error: sellerError } = await supabase
      .from("sellers")
      .upsert(
        { email: sellerEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );

    if (sellerError) {
      console.warn("Could not register the seller:", sellerError.message);
    }
  } catch (sellerError) {
    console.warn("Could not register the seller:", sellerError);
  }

  // Remember the seller's email so the header avatar and /profile open on the
  // person who just posted.
  cookieStore.set(PROFILE_COOKIE, sellerEmail, profileCookieOptions());

  revalidatePath("/");
  revalidatePath("/", "layout");

  return NextResponse.json({ id: data.id }, { status: 201 });
}
