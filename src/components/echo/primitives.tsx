import {
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={cn(
        "glyph-serif text-[22px] leading-none tracking-[0.06em]",
        inverse ? "text-background" : "text-foreground",
      )}
    >
      ECHO
    </span>
  );
}

/* --- Day / night switch: toggles .dark and persists to echo-theme --- */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem("echo-theme", dark ? "dark" : "light");
    } catch {
      /* storage unavailable — theme still applies for the session */
    }
  }, [dark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Toggle day and night mode"
      onClick={() => setDark((d) => !d)}
      className={cn(
        "relative h-7 w-[52px] shrink-0 items-center rounded-full border border-border bg-background/60 px-[3px] transition-colors duration-500 hover:border-ring",
        className,
      )}
    >
      <Sun className="pointer-events-none absolute left-[8px] top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Moon className="pointer-events-none absolute right-[8px] top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <span
        className={cn(
          "block size-5 rounded-full bg-foreground shadow-[0_1px_2px_oklch(0_0_0/0.2)] transition-transform duration-500",
          dark ? "translate-x-[24px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

/* Footnotes / micro copy */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/* --- PageHeader: serif title on the open canvas --- */
export function PageHeader({
  title,
  eyebrow,
  action,
  back,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  back?: { to: string; label?: string; params?: Record<string, string> };
}) {
  return (
    <header className="animate-enter mb-10 mt-4 md:mb-16">
      {back && (
        <Link
          to={back.to}
          {...(back.params ? { params: back.params } : {})}
          className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-opacity duration-500 hover:opacity-60"
        >
          <ChevronLeft className="size-3.5" />
          {back.label ?? "Index"}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <h1 className="glyph-serif text-5xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
        </div>
        {action}
      </div>
      <div className="hairline-t mt-8 md:mt-12" />
    </header>
  );
}

/* --- Full-width KPI band: typography as data, hairlines as boundaries --- */
export function KpiBand({
  items,
  className,
}: {
  items: Array<{ label: string; value: string; note?: string }>;
  className?: string;
}) {
  return (
    <div data-reveal className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "px-1 pb-8 pt-6 sm:px-6 sm:py-5",
            i > 0 && "border-t border-border sm:border-t-0 sm:border-l",
          )}
        >
          <p className="eyebrow mb-4">{item.label}</p>
          <p className="glyph-serif text-4xl leading-none text-foreground md:text-5xl">
            {item.value}
          </p>
          {item.note && <p className="mt-3 text-xs text-muted-foreground">{item.note}</p>}
        </div>
      ))}
    </div>
  );
}

/* --- Editorial form section: numbered, serif-headed, hairline-divided --- */
export function Section({
  index,
  title,
  description,
  children,
  className,
}: {
  index?: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section data-reveal className={cn("hairline-t py-12 first:border-t-0 md:py-16", className)}>
      <div className="mb-10 grid gap-8 md:mb-12 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
        <div>
          {index != null && <Eyebrow className="mb-4">0{index}</Eyebrow>}
          <h2 className="glyph-serif text-3xl leading-tight text-foreground md:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="grid content-start gap-x-16 gap-y-9 md:grid-cols-2">{children}</div>
      </div>
    </section>
  );
}

/* --- Floating underline fields --- */
const floatingLabel =
  "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 translate-y-0 text-[15px] text-muted-foreground transition-all duration-500 ease-luxury " +
  "peer-focus:top-[6px] peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-foreground/60 " +
  "peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] " +
  "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em] peer-[:not(:placeholder-shown)]:text-foreground/60";

export function TextField({
  label,
  className,
  required,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={cn(
        "field-holder group/field relative block cursor-text border-b border-border transition-colors duration-500 focus-within:border-foreground/40",
        className,
      )}
    >
      <input
        {...props}
        required={required}
        placeholder=" "
        className="peer w-full bg-transparent pb-2.5 pt-7 text-[15px] text-foreground outline-none transition-colors duration-500 placeholder:text-transparent"
      />
      <span className={floatingLabel}>
        {label}
        {required && <span className="ml-1 text-foreground/40">*</span>}
      </span>
      <span className="field-line" />
    </label>
  );
}

export function AreaField({
  label,
  className,
  required,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label
      className={cn(
        "field-holder group/field relative block cursor-text border-b border-border transition-colors duration-500 focus-within:border-foreground/40",
        className,
      )}
    >
      <textarea
        {...props}
        required={required}
        placeholder=" "
        className="peer min-h-28 w-full resize-y bg-transparent pt-7 pb-2 text-[15px] leading-relaxed text-foreground outline-none transition-colors duration-500 placeholder:text-transparent"
      />
      <span
        className={cn(
          floatingLabel,
          "top-7 -translate-y-0 peer-focus:top-[6px] peer-focus:translate-y-0 peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:translate-y-0",
        )}
      >
        {label}
        {required && <span className="ml-1 text-foreground/40">*</span>}
      </span>
      <span className="field-line" />
    </label>
  );
}

export function SelectField({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow">{label}</span>
      <span className="field-holder relative mt-2 block border-b border-border transition-colors duration-500 focus-within:border-foreground/40">
        <select
          {...props}
          className="w-full appearance-none bg-transparent py-3 pr-8 text-[15px] text-foreground outline-none"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <span className="field-line" />
      </span>
    </label>
  );
}

/* --- Hairline checkbox row --- */
export function ToggleRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex w-full items-center justify-between gap-6 border-b border-border py-4 text-left transition-opacity duration-500 hover:opacity-70"
    >
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        {detail && <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>}
      </span>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center border transition-all duration-500",
          checked
            ? "border-accent bg-accent text-accent-foreground"
            : "border-muted-foreground/40 text-transparent",
        )}
      >
        <Check
          className={cn("size-3 transition-all duration-500", checked ? "scale-100" : "scale-0")}
        />
      </span>
    </button>
  );
}

/* --- Save bar: full-width hairline, quiet CTA --- */
export function SaveBar({
  label = "Save & Continue",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <div data-reveal className="hairline-t flex justify-end pb-6 pt-8">
      <Button type={onClick ? "button" : "submit"} size="lg" onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}

/* --- Quiet modal: no box, no shadow; just a centered column on the canvas --- */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-5 backdrop-blur-md animate-fade"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-enter w-full max-w-[520px] bg-background"
      >
        <div className="border-b border-border pb-5">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h2 className="glyph-serif text-3xl text-foreground">{title}</h2>
        </div>
        <form onSubmit={submit}>
          <div className="py-8">{children}</div>
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Scroll reveal: cinematic opacity + micro rise, luxury easing --- */
export function useRevealObserver() {
  const observe = () => {
    const els = Array.from(document.querySelectorAll("[data-reveal]:not(.is-bound)"));
    els.forEach((el) => {
      el.classList.add("is-bound");
      if (typeof IntersectionObserver === "undefined") {
        el.classList.add("is-revealed");
        return;
      }
      new IntersectionObserver(
        (entries, io) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
      ).observe(el);
    });
  };
  return observe;
}

/* Small helpers re-exported for compatibility */
export function PageHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("glyph-serif text-3xl text-foreground md:text-4xl", className)}>
      {children}
    </h2>
  );
}

export function DataRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "hairline-b grid grid-cols-[1fr_auto] items-baseline gap-4 py-5 transition-opacity duration-500 last:border-b-0 md:grid-cols-2",
        onClick && "cursor-pointer hover:opacity-70",
        className,
      )}
    >
      {children}
    </div>
  );
}
