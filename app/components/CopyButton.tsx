"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  text: string;
  ariaLabel?: string;
  className?: string;
};

export default function CopyButton({
  text,
  ariaLabel,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 1200);
      return () => clearTimeout(t);
    } catch {
      // no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel ?? "Copy"}
      title={ariaLabel ?? "Copy"}
      className={
        "inline-flex h-6 w-6 items-center justify-center rounded-md border bg-background text-foreground/80 hover:bg-muted transition-colors shrink-0" +
        (className ? ` ${className}` : "")
      }
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
