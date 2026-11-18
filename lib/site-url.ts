import { headers } from "next/headers";

/**
 * Public origin used for Stripe redirect URLs. Set NEXT_PUBLIC_SITE_URL when
 * the app is behind a proxy or running somewhere other than localhost.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}
