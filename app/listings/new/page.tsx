import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = {
  title: "Create new listing",
  description: "Post a new item for sale on Marketplace.",
};

export default function NewListingPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-3 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em]">
        Create new listing
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a photo and a few details — your listing goes live immediately.
      </p>

      <ListingForm />
    </div>
  );
}
