"use server";

import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { isEmail } from "@/lib/format";

export type SendSellerMessageResult =
  | { ok: true; emailSent: boolean }
  | { ok: false; error: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function listingUrl(listingId: string): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("host");

  if (!host) {
    return "";
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}/listings/${listingId}`;
}

async function emailSeller({
  sellerEmail,
  buyerEmail,
  listingTitle,
  listingId,
  message,
}: {
  sellerEmail: string;
  buyerEmail: string;
  listingTitle: string;
  listingId: string;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping the seller notification.");
    return false;
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL || "Marketplace <onboarding@resend.dev>";
  const url = await listingUrl(listingId);

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#050505">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#65676b">Marketplace</p>
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">New message about “${escapeHtml(listingTitle)}”</h1>
      <p style="margin:0 0 8px;font-size:14px;color:#3c3f44">
        <strong>${escapeHtml(buyerEmail)}</strong> wrote:
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;border-left:3px solid #1877f2;background:#f0f4fa;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</blockquote>
      ${
        url
          ? `<a href="${escapeHtml(url)}" style="display:inline-block;background:#1877f2;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">View listing</a>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:12px;color:#65676b">
        Reply directly to this email to answer the buyer.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: sellerEmail,
      replyTo: buyerEmail,
      subject: `New message about “${listingTitle}”`,
      html,
      text: `${buyerEmail} wrote about “${listingTitle}”:\n\n${message}${
        url ? `\n\nView listing: ${url}` : ""
      }\n\nReply directly to this email to answer the buyer.`,
    });

    if (error) {
      console.error("Resend rejected the notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not send the seller notification:", error);
    return false;
  }
}

export async function sendSellerMessage(input: {
  listingId: string;
  buyerEmail: string;
  message: string;
}): Promise<SendSellerMessageResult> {
  const listingId =
    typeof input?.listingId === "string" ? input.listingId.trim() : "";
  const buyerEmail =
    typeof input?.buyerEmail === "string" ? input.buyerEmail.trim() : "";
  const message = typeof input?.message === "string" ? input.message.trim() : "";

  if (!listingId) {
    return { ok: false, error: "Missing listing." };
  }

  if (!isEmail(buyerEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (message.length < 5) {
    return { ok: false, error: "Your message is too short." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, error: "The marketplace is not configured yet." };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Read the seller address from the listing instead of trusting the client.
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, seller_email")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    console.error("Could not load the listing:", listingError);
    return { ok: false, error: "Could not load this listing. Please try again." };
  }

  if (!listing) {
    return { ok: false, error: "This listing is no longer available." };
  }

  const { error: insertError } = await supabase.from("messages").insert({
    listing_id: listing.id,
    buyer_email: buyerEmail,
    seller_email: listing.seller_email,
    message,
  });

  if (insertError) {
    console.error("Could not save the message:", insertError);
    return { ok: false, error: "Could not save your message. Please try again." };
  }

  const emailSent = await emailSeller({
    sellerEmail: listing.seller_email,
    buyerEmail,
    listingTitle: listing.title,
    listingId: listing.id,
    message,
  });

  return { ok: true, emailSent };
}
