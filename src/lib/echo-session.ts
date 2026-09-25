/*
 * Demo session — the sign-in accepts any email / password, so the operator's
 * name entered at login is what the portal greets them with. The greeting
 * itself is derived from the system clock on every render.
 */

import { useEffect, useState } from "react";

const NAME_KEY = "echo-user-name";
const SESSION_KEY = "echo-session";

export const DEFAULT_OPERATOR_NAME = "Linkesh";

export type Greeting = "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night";

/* 5 AM–11:59 AM morning · 12 PM–4:59 PM afternoon · 5 PM–8:59 PM evening · 9 PM–4:59 AM night */
export function greetingFor(at: Date = new Date()): Greeting {
  const hour = at.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

export function greetingLine(name: string, at: Date = new Date()): string {
  return `${greetingFor(at)}, ${name.trim() || DEFAULT_OPERATOR_NAME}.`;
}

export function storeOperatorName(name: string) {
  if (typeof window === "undefined") return;
  const clean = name.trim();
  if (!clean) return;
  try {
    window.sessionStorage.setItem(NAME_KEY, clean);
  } catch {
    /* storage unavailable — the name simply falls back to the default */
  }
}

export function operatorName(): string {
  if (typeof window === "undefined") return DEFAULT_OPERATOR_NAME;
  try {
    return window.sessionStorage.getItem(NAME_KEY) || DEFAULT_OPERATOR_NAME;
  } catch {
    return DEFAULT_OPERATOR_NAME;
  }
}

export function signOutSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(NAME_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/* Re-reads the stored name and re-checks the clock so the greeting follows the day. */
export function useGreeting(): { name: string; greeting: string; at: Date } {
  const [state, setState] = useState(() => ({
    name: operatorName(),
    at: new Date(),
  }));

  useEffect(() => {
    const read = () => setState({ name: operatorName(), at: new Date() });
    read();
    const id = window.setInterval(read, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return { name: state.name, greeting: greetingLine(state.name, state.at), at: state.at };
}
