import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily create the Stripe client so pages still render without a key. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }

  if (!client) {
    client = new Stripe(key, { typescript: true });
  }

  return client;
}

/** Platform keeps 10% of every sale; the rest goes to the seller. */
export const PLATFORM_FEE_RATE = 0.1;
