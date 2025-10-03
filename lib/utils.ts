import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(addr?: string | null, size: number = 6) {
  if (!addr) return "-";
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
}

export function formatTime(ts: string) {
  const n = Number(ts);
  if (!Number.isFinite(n)) return ts;
  return new Date(n * 1000).toLocaleString();
}

export function formatTimeCompact(ts: string) {
  const n = Number(ts);
  if (!Number.isFinite(n)) return ts;
  const date = new Date(n * 1000);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

export function formatToken(token?: string | null, maxLength: number = 6) {
  if (!token) return "-";
  return token.length > maxLength ? token.slice(0, maxLength) + "..." : token;
}

export function formatUSD(
  value: number | null | undefined,
  fractionDigits: number = 2
) {
  if (value == null || !Number.isFinite(value)) return "$-";
  return `$${value.toFixed(fractionDigits)}`;
}
