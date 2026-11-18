import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = {
  title: "Set up payouts",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const { refresh } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-3 pb-16 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
        Marketplace
      </Link>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
          <ShieldCheck className="size-[22px]" strokeWidth={2} />
        </span>

        <h1 className="mt-4 text-[28px] leading-tight font-bold tracking-[-0.02em]">
          Get paid when your items sell
        </h1>

        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Connect a Stripe account so buyers can check out instantly and payouts
          go straight to you. Use the same email you put on your listings.
        </p>

        {refresh ? (
          <p className="mt-4 rounded-lg bg-[#fff4e5] px-3 py-2 text-[13px] leading-relaxed text-[#8a4b00]">
            That onboarding link expired. Enter your email again to pick up where
            you left off.
          </p>
        ) : null}

        <OnboardingForm />
      </div>
    </div>
  );
}
