import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { quickActions } from "@/lib/echo-data";
import { cn } from "@/lib/utils";

interface AppLauncherProps {
  open: boolean;
  onClose: () => void;
}

export function AppLauncher({ open, onClose }: AppLauncherProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-launcher-title"
    >
      {/* Backdrop with blur and tint */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[8px] transition-all duration-[200ms]" />
      
      {/* Popup */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-h-[85dvh] overflow-y-auto rounded-[18px] border border-border bg-background shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)] transition-all duration-[200ms] animate-scale-in
          sm:w-[calc(100vw-48px)] sm:max-w-[720px] sm:rounded-[18px] sm:p-6
          md:p-8 md:max-w-[840px]
          max-[767px]:w-[calc(100vw-24px)] max-[767px]:rounded-[20px] max-[767px]:p-5 max-[767px]:max-h-[85dvh]
          max-[359px]:w-[calc(100vw-20px)] max-[359px]:p-[18px_12px]"
        style={{
          animation: "app-launcher-in 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div>
            <h2 id="app-launcher-title" className="glyph-serif text-2xl text-foreground sm:text-3xl">
              ECHO Applications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose where you want to go
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close launcher"
            className="grid size-10 shrink-0 place-items-center text-muted-foreground transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Grid */}
        <div
          className={cn(
            "grid",
            // Desktop 1024px+
            "grid-cols-2 gap-x-3 gap-y-5",
            "sm:grid-cols-3 sm:gap-x-2 sm:gap-y-5",
            "md:grid-cols-4 md:gap-x-4 md:gap-y-[22px]",
            "lg:grid-cols-5 lg:gap-x-5 lg:gap-y-6"
          )}
        >
          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            // For mobile centering of last items - we need to handle specific cases
            // Desktop: 5 cols, 13 items -> rows of 5,5,3 (last row center)
            // Tablet: 4 cols, last item centered
            // Mobile: 3 cols, last item centered
            // Small mobile: 2 cols
            const isLastRowDesktop = idx >= 10; // items 10,11,12 are last row (0-indexed 10,11,12 for 13 items? 0-4 row1,5-9 row2,10,11,12 row3 = 3 items)
            const isLastRowTablet = idx >= 12; // 4 cols, 12th is index 12 (0-based, 13 items means index 12 is 13th) - last item alone
            const isLastRowMobile = idx >= 12; // 3 cols, 13 items -> rows of 3,3,3,3,1 (last single centered)
            const isLastRowSmall = false; // 2 cols, won't be single centered in same way
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "group flex flex-col items-center justify-start gap-2.5 text-center transition-all duration-300",
                  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring rounded-lg",
                  // Centering for last rows
                  "lg:col-span-1",
                  isLastRowDesktop && idx === 10 && "lg:col-start-2",
                  isLastRowDesktop && idx === 11 && "lg:col-start-3",
                  isLastRowDesktop && idx === 12 && "lg:col-start-4",
                  "md:col-span-1",
                  isLastRowTablet && "md:col-start-2 md:col-end-4", // center single item in 4-col grid
                  "max-[1023px]:md:grid",
                  "sm:col-span-1",
                  isLastRowMobile && "sm:col-start-2", // center in 3-col
                  "max-[767px]:col-span-1",
                  "max-[359px]:col-span-1"
                )}
                style={{
                  // More precise centering
                }}
              >
                <div
                  className={cn(
                    "grid place-items-center rounded-xl border border-border bg-secondary/50 transition-all duration-300",
                    "group-hover:-translate-y-[2px] group-hover:bg-secondary group-focus-visible:-translate-y-[2px] group-focus-visible:bg-secondary",
                    "group-active:translate-y-0",
                    // sizes
                    "size-[48px] max-[359px]:size-[48px]",
                    "sm:size-[52px]",
                    "md:size-[56px]",
                    "lg:size-[64px]"
                  )}
                >
                  <Icon
                    className={cn(
                      "text-foreground",
                      "size-[22px] max-[359px]:size-[22px]",
                      "sm:size-[22px]",
                      "md:size-[24px]",
                      "lg:size-[26px]"
                    )}
                    strokeWidth={1.75}
                  />
                </div>
                <span
                  className={cn(
                    "text-center leading-tight text-foreground",
                    "text-[12px] max-[359px]:text-[12px] max-[359px]:line-clamp-2",
                    "sm:text-[12px] sm:line-clamp-2",
                    "md:text-[13px]",
                    "lg:text-[13px] lg:max-w-[110px] lg:line-clamp-2"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
