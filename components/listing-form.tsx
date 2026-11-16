"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS } from "@/lib/categories";
import { displayNameFromEmail, formatPrice, isEmail } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export function ListingForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pickFile(next: File | undefined | null) {
    if (!next) return;

    if (!next.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (next.size > 5 * 1024 * 1024) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }

    setFile(next);
    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(next);
    });
  }

  function clearFile() {
    setFile(null);
    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 3) {
      toast.error("Give your listing a title (at least 3 characters).");
      return;
    }

    const amount = Number(price);
    if (!price.trim() || !Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid price.");
      return;
    }

    if (!CATEGORY_LABELS.includes(category)) {
      toast.error("Pick a category.");
      return;
    }

    if (!isEmail(email.trim())) {
      toast.error("Enter a valid email so buyers can reach you.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (file) {
        const supabase = createClient();
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        imageUrl = supabase.storage
          .from("listing-images")
          .getPublicUrl(path).data.publicUrl;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: amount,
          category,
          description: description.trim() || null,
          seller_email: email.trim(),
          location: "Palo Alto, CA",
          image_url: imageUrl,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not publish your listing.");
      }

      toast.success("Listing published!");
      router.push(`/listings/${payload.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not publish your listing.",
      );
      setSubmitting(false);
    }
  }

  const sellerName = email ? displayNameFromEmail(email) : "Your name";
  const priceLabel =
    price.trim() && Number.isFinite(Number(price))
      ? formatPrice(Number(price))
      : "Price";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)_280px]"
    >
      <div className="space-y-3">
        <label
          htmlFor="photo"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5 transition-colors",
            !preview && "border border-dashed border-border hover:bg-white/70",
            dragging && "ring-2 ring-primary",
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Listing preview"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="size-7" strokeWidth={1.6} />
              <span className="text-[17px] font-semibold text-foreground">
                Add photos
              </span>
            </span>
          )}
        </label>

        <input
          ref={fileInputRef}
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => pickFile(event.target.files?.[0])}
        />

        {preview ? (
          <button
            type="button"
            onClick={clearFile}
            className="text-[13px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Remove photo
          </button>
        ) : null}

        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          aria-label="Title"
          maxLength={120}
          className="h-12 rounded-lg bg-white text-[15px]"
        />

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
            aria-label="Price"
            className="h-12 rounded-lg bg-white pl-7 text-[15px]"
          />
        </div>

        <div className="relative">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Category"
            className="h-12 w-full appearance-none rounded-lg border border-input bg-white px-3 pr-9 text-[15px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Category
            </option>
            {CATEGORY_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          aria-label="Email"
          className="h-12 rounded-lg bg-white text-[15px]"
        />

        <Textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          aria-label="Description"
          className="min-h-28 rounded-lg bg-white text-[15px]"
        />

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 w-full gap-2 rounded-lg text-[15px] font-semibold"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitting ? "Publishing…" : "Publish listing"}
        </Button>

        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Your listing is public. Buyers reach you at the email above.
        </p>
      </div>

      <div className="hidden lg:block">
        <div className="mx-auto w-full max-w-[480px]">
          <p className="text-[15px] font-semibold">Preview</p>
          <div className="relative mt-2 aspect-[4/5] w-full overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
            {preview ? (
              <Image
                src={preview}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[#e4e6eb]">
                <ImageIcon
                  className="size-10 text-muted-foreground/50"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <p className="mt-7 text-[24px] leading-tight font-bold break-words">
          {title.trim() || "Title"}
        </p>
        <p className="text-[24px] font-bold">{priceLabel}</p>

        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          Listed just now
          <br />
          in Palo Alto, CA
        </p>

        <p className="mt-7 text-[17px] font-bold">Seller information</p>
        <p className="mt-1 text-[15px] break-words">{sellerName}</p>
        {email ? (
          <p className="text-[13px] break-words text-muted-foreground">
            {email}
          </p>
        ) : null}
      </div>
    </form>
  );
}
