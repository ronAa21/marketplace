"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isEmail } from "@/lib/format";

export function MessageSellerForm({
  listingId,
  sellerEmail,
  listingTitle,
}: {
  listingId: string;
  sellerEmail: string;
  listingTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function reset() {
    setEmail("");
    setMessage("");
    setSent(false);
    setEmailSent(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEmail(email)) {
      toast.error("Enter a valid email address so the seller can reply.");
      return;
    }

    if (message.trim().length < 5) {
      toast.error("Add a short message for the seller.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          buyer_email: email.trim(),
          message: message.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send your message.");
      }

      setSent(true);
      setEmailSent(Boolean(payload.emailSent));
      toast.success("Message sent to the seller.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-2 rounded-xl bg-white p-6 text-center ring-1 ring-black/5">
        <CheckCircle2 className="mx-auto size-8 text-primary" />
        <p className="mt-2 text-[15px] font-semibold">Message sent</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          {emailSent
            ? `We emailed ${sellerEmail}. They can reply straight to your inbox.`
            : "Your message was saved and the seller will see it with their listing."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-3 text-[13px] font-semibold text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <Input
        type="email"
        required
        autoComplete="email"
        placeholder="Your email"
        aria-label="Your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-11 rounded-lg bg-white"
      />

      <Textarea
        required
        rows={5}
        placeholder={`Hi! Is “${listingTitle}” still available?`}
        aria-label="Message to the seller"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-h-[140px] rounded-lg bg-white"
      />

      <Button
        type="submit"
        disabled={sending}
        className="h-11 w-full gap-2 rounded-lg text-[15px] font-semibold"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : null}
        {sending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
