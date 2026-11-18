"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  email: string;
  name: string | null;
  location: string | null;
  bio: string | null;
};

export function EditProfileDialog({ email, name, location, bio }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    startSaving(async () => {
      const result = await updateProfile(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-10 shrink-0 gap-2 rounded-lg px-4 text-[14px] font-semibold"
          />
        }
      >
        <Pencil className="size-4" />
        Edit profile
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold">Edit profile</DialogTitle>
          <DialogDescription>
            This is what buyers see next to your listings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="edit-name" className="block text-[13px] font-semibold">
              Display name
            </label>
            <Input
              id="edit-name"
              name="display_name"
              defaultValue={name ?? ""}
              maxLength={60}
              placeholder="Your name"
              className="h-10 rounded-lg bg-white text-[15px]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-location"
              className="block text-[13px] font-semibold"
            >
              Location
            </label>
            <Input
              id="edit-location"
              name="location"
              defaultValue={location ?? ""}
              maxLength={120}
              placeholder="City, State"
              className="h-10 rounded-lg bg-white text-[15px]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-bio" className="block text-[13px] font-semibold">
              Bio
            </label>
            <Textarea
              id="edit-bio"
              name="bio"
              defaultValue={bio ?? ""}
              rows={4}
              maxLength={400}
              placeholder="Tell buyers a little about yourself"
              className="min-h-24 rounded-lg bg-white text-[15px]"
            />
          </div>

          <p className="text-[12px] text-muted-foreground">
            Signed in as <span className="font-medium">{email}</span>
          </p>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
