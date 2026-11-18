export function formatPrice(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function timeAgo(value: string): string {
  const then = new Date(value).getTime();

  if (Number.isNaN(then)) {
    return "just now";
  }

  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let remaining = seconds;

  for (const [size, name] of units) {
    if (remaining < size) {
      const rounded = Math.floor(remaining);
      return `${rounded} ${name}${rounded === 1 ? "" : "s"} ago`;
    }
    remaining = remaining / size;
  }

  return "just now";
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";

  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return name || "Marketplace seller";
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** One or two letters for an avatar, from a display name or an email. */
export function initialsFrom(value: string): string {
  const source = value.includes("@") ? displayNameFromEmail(value) : value;
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const letters =
    parts.length === 1
      ? parts[0].charAt(0)
      : `${parts[0][0]}${parts[parts.length - 1][0]}`;

  return letters.toUpperCase();
}
