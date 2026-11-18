import { cookies } from "next/headers";
import { isEmail } from "@/lib/format";

/**
 * This app has no auth yet. The profile is keyed by the email a seller types
 * on a listing, and that email is remembered in a plain cookie. It identifies
 * the profile only — it is not a credential and grants no access.
 */
export const PROFILE_COOKIE = "marketplace_email";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function profileCookieOptions() {
  return {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax" as const,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  };
}

/** The email of the profile currently open in this browser, if any. */
export async function getProfileEmail(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(PROFILE_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const email = raw.trim().toLowerCase();
  return isEmail(email) ? email : null;
}
