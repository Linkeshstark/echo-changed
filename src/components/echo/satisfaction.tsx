import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { satisfactionLabels, type Satisfaction } from "@/lib/echo-ops-data";

/* Interactive 1–5 star input used after a task is approved or an activity closes. */
export function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-3" onMouseLeave={() => setHover(0)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-label={`${n} star${n > 1 ? "s" : ""} — ${satisfactionLabels[n]}`}
            aria-pressed={value === n}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(n)}
            className={cn(
              "transition-[color,transform] duration-500",
              disabled && "cursor-not-allowed opacity-60",
              n <= shown ? "text-foreground" : "text-muted-foreground/40",
              "hover:scale-110 focus-visible:scale-110 outline-none",
            )}
          >
            <Star
              className={cn("size-6", n <= shown ? "fill-current" : "fill-transparent")}
              strokeWidth={1.25}
            />
          </button>
        ))}
      </div>
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {shown ? satisfactionLabels[shown] : "Not rated"}
      </span>
    </div>
  );
}

/* Read-only stars for profile, history, and performance views. */
export function SatisfactionReadout({
  satisfaction,
  className,
  showComment = true,
}: {
  satisfaction?: Satisfaction;
  className?: string;
  showComment?: boolean;
}) {
  if (!satisfaction?.rating) {
    return <span className={cn("text-sm text-muted-foreground", className)}>Not rated yet</span>;
  }
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5" aria-label={`${satisfaction.rating} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              strokeWidth={1.25}
              className={cn(
                "size-4",
                n <= satisfaction.rating
                  ? "fill-foreground text-foreground"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-foreground">
          {satisfaction.rating} · {satisfactionLabels[Math.round(satisfaction.rating)] ?? "Unrated"}
        </span>
      </div>
      {showComment && satisfaction.comment ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          “{satisfaction.comment}”
        </p>
      ) : null}
      {satisfaction.ratedBy || satisfaction.ratedOn ? (
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {[satisfaction.ratedBy, satisfaction.ratedOn].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
