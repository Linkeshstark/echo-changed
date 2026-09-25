/*
 * Mock call affordance — no telephony here, the button only reflects the
 * "Calling..." state. Placed wherever an employee or client phone is shown.
 */

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function CallButton({
  phone,
  name,
  tone = "quiet",
  className,
}: {
  phone?: string | undefined;
  name?: string | undefined;
  tone?: "quiet" | "solid";
  className?: string | undefined;
}) {
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    if (!calling) return;
    const id = window.setTimeout(() => setCalling(false), 2600);
    return () => window.clearTimeout(id);
  }, [calling]);

  if (!phone) return null;

  return (
    <button
      type="button"
      onClick={() => setCalling(true)}
      title={`Call ${name ?? phone}`}
      aria-label={`Call ${name ?? phone}`}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] transition-opacity duration-500 hover:opacity-60",
        tone === "solid"
          ? "border border-border px-2.5 py-1.5 text-foreground"
          : "text-muted-foreground",
        calling ? "text-foreground" : "",
        className,
      )}
    >
      <Phone className={cn("size-3.5", calling && "animate-pulse")} />
      {calling ? "Calling..." : "Call"}
    </button>
  );
}

/* Phone number with the call button sitting right next to it. */
export function CallablePhone({
  phone,
  name,
  className,
}: {
  phone?: string | undefined;
  name?: string | undefined;
  className?: string | undefined;
}) {
  if (!phone) return null;
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="text-[15px] text-foreground">{phone}</span>
      <CallButton phone={phone} name={name} />
    </span>
  );
}
