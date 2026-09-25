import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  Bell,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  HeartHandshake,
  ListChecks,
  Menu,
  MessageCircle,
  ReceiptText,
  Search,
  X,
} from "lucide-react";
import { Brand, ThemeToggle, useRevealObserver } from "./primitives";
import { navSections, searchRecords } from "@/lib/echo-data";
import {
  markRead,
  restoreRead,
  useNotifications,
  type Notification,
  type NotificationIcon,
} from "@/lib/echo-notifications";
import { cn } from "@/lib/utils";

/* --- Notification bell --- */

const notificationIcons: Record<NotificationIcon, ReactNode> = {
  task: <ClipboardCheck className="size-4" />,
  voucher: <ReceiptText className="size-4" />,
  maintenance: <CalendarClock className="size-4" />,
  activity: <ClipboardCheck className="size-4" />,
  donation: <HeartHandshake className="size-4" />,
  payroll: <Banknote className="size-4" />,
  employee: <CircleUserRound className="size-4" />,
  client: <Building2 className="size-4" />,
  chat: <MessageCircle className="size-4" />,
  submission: <ListChecks className="size-4" />,
};

/** Marks the notification read, then opens the page and record it points at. */
function useNotificationOpener() {
  const navigate = useNavigate();
  return (n: Notification) => {
    markRead(n.id);
    const { target } = n;
    switch (target.to) {
      case "/monitor/$employeeId":
        navigate({ to: target.to, params: target.params, search: target.search });
        break;
      case "/payroll/$employeeId":
        navigate({ to: target.to, params: target.params, search: target.search });
        break;
      case "/raised-voucher/$voucherCode":
      case "/maintenance/$code":
      case "/raised-activity/$code":
      case "/donation/$code":
      case "/employees/$employeeId":
      case "/clients/$clientName":
      case "/chats/$groupId":
      case "/submissions/$employeeId/$taskId":
        navigate({ to: target.to, params: target.params });
        break;
    }
  };
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const observeReveal = useRevealObserver();
  const alertsRef = useRef<HTMLDivElement>(null);

  const notifications = useNotifications();
  const openNotification = useNotificationOpener();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(restoreRead, []);

  useEffect(() => {
    if (!alertsOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!alertsRef.current?.contains(e.target as Node)) setAlertsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [alertsOpen]);

  useEffect(() => {
    observeReveal();
    const mo = new MutationObserver(observeReveal);
    mo.observe(document.body, { childList: true, subtree: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setAlertsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      mo.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [observeReveal, pathname]);

  const results = useMemo(
    () =>
      query.trim()
        ? searchRecords
            .filter((item) =>
              `${item.type} ${item.label} ${item.detail}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .slice(0, 8)
        : [],
    [query],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Transparent glass navigation — logo, Home, search, profile, alerts, menu */}
      <header className="echo-glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-5 md:px-10">
          <Link to="/dashboard" aria-label="ECHO home" className="shrink-0">
            <Brand />
          </Link>

          <Link
            to="/dashboard"
            className={cn(
              "nav-link text-[13px] font-medium tracking-[0.02em] text-muted-foreground transition-colors duration-500 hover:text-foreground",
              pathname === "/dashboard" && "is-active text-foreground",
            )}
          >
            Home
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle className="hidden sm:flex" />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-3 text-[13px] text-muted-foreground transition-opacity duration-500 hover:opacity-60 sm:flex"
            >
              <Search className="size-4" />
              Search
              <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 text-[10px] tracking-wider text-muted-foreground lg:inline">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/settings"
              aria-label="Profile settings"
              className="grid size-10 place-items-center text-muted-foreground transition-opacity duration-500 hover:opacity-60"
            >
              <CircleUserRound className="size-[18px]" />
            </Link>
            <div className="relative" ref={alertsRef}>
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={alertsOpen}
                onClick={() => setAlertsOpen((open) => !open)}
                className="relative grid size-10 place-items-center text-muted-foreground transition-opacity duration-500 hover:opacity-60"
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute right-2.5 top-2.5 size-1 rounded-full bg-accent" />
                )}
              </button>

              {alertsOpen && (
                <div className="fixed inset-x-5 top-[4.5rem] z-50 animate-enter border border-border bg-background sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[22rem]">
                  <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">
                      Notifications
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                      {unread > 0 ? `${unread} unread` : "All read"}
                    </p>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          openNotification(n);
                          setAlertsOpen(false);
                        }}
                        className="flex w-full items-start gap-4 border-b border-border py-4 text-left transition-opacity duration-500 last:border-b-0 hover:opacity-70"
                      >
                        <span className="mt-0.5 shrink-0 text-muted-foreground">
                          {notificationIcons[n.icon]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[15px]",
                              n.read ? "text-muted-foreground" : "text-foreground",
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {n.detail}
                          </span>
                          <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                            {n.at}
                          </span>
                        </span>
                        <span
                          title={n.read ? "Read" : "Unread"}
                          className={cn(
                            "mt-2 size-1 shrink-0 rounded-full",
                            n.read ? "bg-transparent" : "bg-accent",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center text-foreground"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-[1440px] px-5 pb-24 pt-10 md:px-10 md:pt-16">
        {pathname !== "/dashboard" && (
          <Link
            to="/dashboard"
            className="mb-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-opacity duration-500 hover:opacity-60"
          >
            <ChevronLeft className="size-3.5" /> Back to Home
          </Link>
        )}
        {children}
      </main>

      <footer className="hairline-t py-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/60">
          ECHO — Operational Headquarters
        </p>
      </footer>

      {/* Full-canvas menu — hairline rows, no rounded panels */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-fade bg-background/60 backdrop-blur-md"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="echo-glass ml-auto flex h-full w-full max-w-md animate-rise flex-col border-l border-border"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-7">
              <Brand />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-7 py-4" aria-label="Menu">
              {navSections.map((section) => (
                <div key={section.title} className="pt-7 first:pt-0">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">
                    {section.title}
                  </p>
                  {section.items.map((item, i) => (
                    <div key={item.to} className="border-b border-border">
                      <Link
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="group flex w-full items-center justify-between py-5"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="text-[11px] tabular-nums text-muted-foreground/60">
                            0{i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[15px]",
                              pathname === item.to
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {item.label}
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </nav>
            <div className="border-t border-border px-7 py-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">
                Version 3.0 — Obsidian
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Command search — continuous, hairline rows */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-fade items-start justify-center bg-background/70 px-5 pt-[10vh] backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl animate-enter bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-border px-1 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, clients, tasks, files…"
                className="h-10 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <kbd className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>
            <div className="max-h-[55vh] overflow-auto">
              {query && results.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">No results found</p>
              )}
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.label}`}
                  to={result.to}
                  onClick={() => setSearchOpen(false)}
                  className="group flex items-center justify-between border-b border-border py-4 pl-1 pr-2 transition-opacity duration-500 hover:opacity-70"
                >
                  <span className="flex items-baseline gap-6 overflow-hidden">
                    <span className="w-10 shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {result.type}
                    </span>
                    <span className="truncate text-[15px] text-foreground">{result.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{result.detail}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
