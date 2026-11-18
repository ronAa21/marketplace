"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isEmail } from "@/lib/format";
import {
  PROFILE_COOKIE,
  getProfileEmail,
  profileCookieOptions,
} from "@/lib/session";
import { createStatelessClient } from "@/utils/supabase/stateless";

export type ProfileFormState = { error?: string };

/** Sign in to a profile by email — there is no password in this demo. */
export async function setProfileEmail(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  try {
    const supabase = createStatelessClient();
    const { error } = await supabase
      .from("sellers")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (error) {
      console.error("Could not create the seller profile:", error);
      return { error: "Could not open that profile. Please try again." };
    }
  } catch (error) {
    console.error("Could not create the seller profile:", error);
    return { error: "Could not reach the database. Please try again." };
  }

  const store = await cookies();
  store.set(PROFILE_COOKIE, email, profileCookieOptions());

  revalidatePath("/", "layout");
  redirect("/profile");
}

/** Save the display name, location and bio shown on the profile page. */
export async function updateProfile(
  formData: FormData,
): Promise<ProfileFormState> {
  const email = await getProfileEmail();

  if (!email) {
    return { error: "Open a profile before editing it." };
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (displayName.length > 60) {
    return { error: "Keep your name under 60 characters." };
  }

  if (location.length > 120) {
    return { error: "Keep your location under 120 characters." };
  }

  if (bio.length > 400) {
    return { error: "Keep your bio under 400 characters." };
  }

  try {
    const supabase = createStatelessClient();
    const { error } = await supabase.from("sellers").upsert(
      {
        email,
        display_name: displayName || null,
        location: location || null,
        bio: bio || null,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("Could not update the seller profile:", error);

      // PostgREST reports missing columns as PGRST204 (schema cache) or 42703
      // (Postgres undefined_column), depending on whether it has reloaded.
      if (error.code === "PGRST204" || error.code === "42703") {
        return {
          error:
            "The sellers table is missing the profile columns. Run the seller section of supabase/schema.sql, then try again.",
        };
      }

      return { error: "Could not save your profile. Please try again." };
    }
  } catch (error) {
    console.error("Could not update the seller profile:", error);
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");

  return {};
}

/** Forget the profile in this browser. The seller row itself is kept. */
export async function signOutProfile(): Promise<void> {
  const store = await cookies();
  store.delete(PROFILE_COOKIE);

  revalidatePath("/", "layout");
  redirect("/");
}
