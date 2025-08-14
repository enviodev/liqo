"use client";

import { useRef, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  defaultLimit?: number;
  className?: string;
};

export default function DownloadCsv({ defaultLimit = 1000, className }: Props) {
  const [email, setEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isBusy;

  async function beginDownload() {
    if (disabled) return;
    try {
      setIsBusy(true);
      const downloadLink = `${
        window.location.origin
      }/api/export?email=${encodeURIComponent(email)}&limit=${defaultLimit}`;
      const res = await fetch(downloadLink, { method: "GET" });
      if (!res.ok) {
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
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className}>
          <DownloadIcon
            className="-ms-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Download CSV
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          emailInputRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <DownloadIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Download CSV Export</DialogTitle>
            <DialogDescription className="text-left">
              Enter your email to download the last {defaultLimit} liquidations
              as CSV. For the full dataset, reach out to jonjon@envio.dev.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            beginDownload();
          }}
        >
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label>Email address</Label>
              <Input
                ref={emailInputRef}
                id="download-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={disabled}>
            {isBusy ? "Preparing…" : "Download CSV"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
