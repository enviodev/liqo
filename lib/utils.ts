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

export function formatToken(token?: string | null, maxLength: number = 6) {
  if (!token) return "-";
  return token.length > maxLength ? token.slice(0, maxLength) + "..." : token;
}
