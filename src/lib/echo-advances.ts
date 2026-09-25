/*
 * Update Salary — advances and deductions share one reactive store so a new entry
 * shows up in the list, the search index and the employee tabs straight away.
 * Everything here is mock data; nothing is sent anywhere.
 */

import { useSyncExternalStore } from "react";
import { advances as seedAdvances } from "./echo-data";

export type AdvanceRecord = {
  employee: string;
  id: string;
  amount: string;
  date: string;
  time: string;
  reason: string;
};

export type DeductionRecord = {
  employee: string;
  id: string;
  amount: string;
  date: string;
  time: string;
  reason: string;
};

export const advanceReasons = [
  "Medical Emergency",
  "Family Expense",
  "Travel",
  "Festival",
  "Other (manual)",
];

let advances: AdvanceRecord[] = seedAdvances.map((a) => ({
  ...a,
  reason: "Medical Emergency",
}));

let deductions: DeductionRecord[] = [
  {
    employee: "Arjun Mehta",
    id: "E-1042",
    amount: "₹1,200",
    date: "17 Sep 2026",
    time: "11:20 AM",
    reason: "Provident Fund — late deposit",
  },
  {
    employee: "Maya Iyer",
    id: "E-1078",
    amount: "₹850",
    date: "15 Sep 2026",
    time: "3:40 PM",
    reason: "Uniform allowance adjustment",
  },
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/* HTML date/time inputs come in as yyyy-mm-dd and HH:mm — store them like the rest of the portal. */
export function prettyDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function prettyTime(hhmm: string): string {
  const [rawH, rawM] = hhmm.split(":");
  const h = Number(rawH);
  const m = Number(rawM);
  if (rawH === undefined || Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function stampNow() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function useAdvances(): AdvanceRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => advances,
    () => advances,
  );
}

export function useDeductions(): DeductionRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => deductions,
    () => deductions,
  );
}

export function advancesOf(employeeId: string): AdvanceRecord[] {
  return advances.filter((a) => a.id === employeeId);
}

export function deductionsOf(employeeId: string): DeductionRecord[] {
  return deductions.filter((d) => d.id === employeeId);
}

export function addAdvance(input: {
  employee: string;
  id: string;
  amount: number;
  reason: string;
}) {
  const { date, time } = stampNow();
  advances = [
    {
      employee: input.employee,
      id: input.id,
      amount: `₹${input.amount.toLocaleString("en-IN")}`,
      date,
      time,
      reason: input.reason,
    },
    ...advances,
  ];
  emit();
}

export function addDeduction(input: {
  employee: string;
  id: string;
  amount: number;
  reason: string;
  date?: string;
  time?: string;
}) {
  const stamped = stampNow();
  const date = input.date ? prettyDate(input.date) : stamped.date;
  const time = input.time ? prettyTime(input.time) : stamped.time;
  deductions = [
    {
      employee: input.employee,
      id: input.id,
      amount: `₹${input.amount.toLocaleString("en-IN")}`,
      date,
      time,
      reason: input.reason,
    },
    ...deductions,
  ];
  emit();
}
