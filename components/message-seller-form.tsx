"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendSellerMessage } from "@/app/actions/messages";
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
      const result = await sendSellerMessage({
        listingId,
        buyerEmail: email.trim(),
        message: message.trim(),
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      setSent(true);
      setEmailSent(result.emailSent);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          aria-label="Your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 rounded-lg bg-white text-[15px]"
        />

        <Textarea
          required
          rows={5}
          placeholder={`I want to buy your ${listingTitle}!`}
          aria-label="Message to the seller"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-[160px] rounded-lg bg-white px-3 py-2.5 text-[15px] leading-relaxed"
        />

        <Button
          type="submit"
          disabled={sending}
          className="h-11 w-full gap-2 rounded-lg text-[16px] font-semibold"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : null}
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>

      <Dialog
        open={sent}
        onOpenChange={(open) => {
          if (!open) reset();
        }}
      >
        <DialogContent showCloseButton={false} className="gap-5 p-6 sm:max-w-[360px]">
          <DialogHeader className="items-center text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent">
              <CheckCircle2 className="size-6 text-primary" />
            </span>
            <DialogTitle className="mt-1 text-[18px] leading-snug font-bold">
              Message sent
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed">
              {emailSent
                ? `We emailed ${sellerEmail}. They can reply straight to your inbox.`
                : "Your message was saved and the seller will see it with their listing."}
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            onClick={reset}
            className="h-11 w-full rounded-lg text-[15px] font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
