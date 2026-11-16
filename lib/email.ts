const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Emails the seller about a new buyer message through Resend.
 * Returns false when email is not configured or the request fails so the
 * message can still be stored without blocking the buyer.
 */
export async function sendMessageNotification({
  to,
  buyerEmail,
  message,
  listingTitle,
  listingUrl,
}: {
  to: string;
  buyerEmail: string;
  message: string;
  listingTitle: string;
  listingUrl: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return false;
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Marketplace <onboarding@resend.dev>";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1b2420">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7770">Marketplace</p>
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">New message about “${escapeHtml(listingTitle)}”</h1>
      <p style="margin:0 0 8px;font-size:14px;color:#44514a">
        <strong>${escapeHtml(buyerEmail)}</strong> wrote:
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;border-left:3px solid #3f7d5c;background:#f4f7f5;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(
        message,
      )}</blockquote>
      <a href="${escapeHtml(
        listingUrl,
      )}" style="display:inline-block;background:#3f7d5c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">View listing</a>
      <p style="margin:24px 0 0;font-size:12px;color:#7c8a82">
        Reply directly to this email to answer the buyer.
      </p>
    </div>
  `;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: buyerEmail,
        subject: `New message about “${listingTitle}”`,
        html,
      }),
    });

    if (!response.ok) {
      console.error(
        "Resend rejected the notification:",
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not send the seller notification:", error);
    return false;
  }
}
