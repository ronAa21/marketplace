"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  List,
  Loader2,
  LogOut,
  MessageSquare,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutProfile } from "@/app/actions/profile";
import { initialsFrom } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  email: string | null;
  name: string | null;
  location: string | null;
};

export function ProfileMenu({ email, name, location }: Props) {
  const [signingOut, startSignOut] = useTransition();
  const label = name ?? "Your profile";
  const subtitle = location ?? email ?? "Set up your profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open profile menu"
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full text-[15px] font-bold transition-shadow outline-none",
          "focus-visible:ring-3 focus-visible:ring-primary/30",
          email
            ? "bg-accent text-primary ring-2 ring-primary/30 hover:ring-primary/50"
            : "bg-secondary text-muted-foreground ring-2 ring-black/5 hover:ring-black/10",
        )}
      >
        {email ? initialsFrom(name ?? email) : <UserRound className="size-5" />}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[288px] min-w-[288px] rounded-2xl p-2 shadow-[0_4px_24px_rgba(0,0,0,0.14)] ring-black/5"
      >
        <div className="flex items-center gap-3 px-2 py-2.5">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full text-[15px] font-bold",
              email
                ? "bg-accent text-primary"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {email ? (
              initialsFrom(name ?? email)
            ) : (
              <UserRound className="size-5" />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[15px] leading-5 font-bold">{label}</p>
            <p className="truncate text-[13px] leading-4 text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="mt-1 flex h-10 w-full items-center justify-center rounded-lg border border-border px-3 text-[14px] font-semibold transition-colors hover:bg-muted"
        >
          {email ? "View profile" : "Set up profile"}
        </Link>

        {email ? (
          <>
            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              render={<Link href="/profile?tab=listings" />}
              className="h-10 gap-2.5 rounded-lg px-2 text-[15px]"
            >
              <List className="size-[18px] text-muted-foreground" />
              My listings
            </DropdownMenuItem>

            <DropdownMenuItem
              render={<Link href="/profile?tab=messages" />}
              className="h-10 gap-2.5 rounded-lg px-2 text-[15px]"
            >
              <MessageSquare className="size-[18px] text-muted-foreground" />
              Messages
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              disabled={signingOut}
              onClick={() => startSignOut(() => signOutProfile())}
              className="h-10 gap-2.5 rounded-lg px-2 text-[15px]"
            >
              {signingOut ? (
                <Loader2 className="size-[18px] animate-spin text-muted-foreground" />
              ) : (
                <LogOut className="size-[18px] text-muted-foreground" />
              )}
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <p className="px-2 pt-1 pb-2 text-[12px] leading-relaxed text-muted-foreground">
            Use the email you post listings with to see your listings, messages
            and payouts.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
