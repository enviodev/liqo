"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  defaultLimit?: number;
  className?: string;
};

export default function DownloadCsv({ defaultLimit = 1000, className }: Props) {
  const [email, setEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isBusy;

  const href = useMemo(() => {
    const p = new URLSearchParams({ email, limit: String(defaultLimit) });
    return `/api/export?${p.toString()}`;
  }, [email, defaultLimit]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => emailInputRef.current?.focus(), 50);
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.clearTimeout(t);
      };
    }
  }, [open]);

  async function beginDownload() {
    if (disabled) return;
    try {
      setIsBusy(true);
      const res = await fetch(href, { method: "GET" });
      if (!res.ok) {
        // eslint-disable-next-line no-alert
        alert("Failed to generate CSV. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `liqo_recent_${defaultLimit}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-7 items-center rounded-md border px-2 text-[11px] font-medium bg-background hover:bg-muted transition-colors"
        )}
        onClick={() => setOpen(true)}
      >
        Download CSV
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">
                  Download last 1000 results
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Please enter your email to continue. Thanks — reach out to
                  jonjon@envio.dev for full dataset.
                </div>
              </div>
              <button
                type="button"
                className="h-6 w-6 rounded-md border text-xs hover:bg-muted"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                ref={emailInputRef}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-sm focus:outline-none"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={beginDownload}
                className={cn(
                  "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors",
                  disabled ? "opacity-50" : "bg-background hover:bg-muted"
                )}
              >
                {isBusy ? "Preparing…" : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
