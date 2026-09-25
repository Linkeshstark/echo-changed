/*
 * Donation — a small reactive store so a donation raised from the page shows up in
 * the table, the totals and the search index immediately. Mock data only.
 */

import { useSyncExternalStore } from "react";

export type DonationStatus = "Pending" | "Approved" | "Rejected";

export type DonationPurpose =
  "Disaster Relief" | "Education" | "Medical" | "Community" | "Other (manual)";

export const donationPurposes: DonationPurpose[] = [
  "Disaster Relief",
  "Education",
  "Medical",
  "Community",
  "Other (manual)",
];

export type PaymentMode = "UPI" | "Bank Transfer" | "Cash" | "Cheque";

export type DonationRecord = {
  code: string;
  donor: string;
  email: string;
  phone: string;
  purpose: DonationPurpose;
  purposeNote?: string;
  amount: number;
  mode: PaymentMode;
  date: string;
  time: string;
  status: DonationStatus;
  note?: string;
  receiptNo?: string;
};

let donations: DonationRecord[] = [
  {
    code: "DON-001",
    donor: "Meera Raghavan",
    email: "meera.raghavan@asterlabs.in",
    phone: "+91 98410 22341",
    purpose: "Medical",
    amount: 25000,
    mode: "Bank Transfer",
    date: "22 Sep 2026",
    time: "9:15 AM",
    status: "Approved",
    receiptNo: "RCP-7741",
  },
  {
    code: "DON-002",
    donor: "Vikram Desai",
    email: "vikram.desai@novaretail.in",
    phone: "+91 98840 55212",
    purpose: "Education",
    amount: 15000,
    mode: "UPI",
    date: "21 Sep 2026",
    time: "4:50 PM",
    status: "Pending",
  },
  {
    code: "DON-003",
    donor: "Anita Fernandes",
    email: "anita.fernandes@gmail.com",
    phone: "+91 90031 77412",
    purpose: "Disaster Relief",
    amount: 40000,
    mode: "Bank Transfer",
    date: "19 Sep 2026",
    time: "11:05 AM",
    status: "Approved",
    receiptNo: "RCP-7738",
  },
  {
    code: "DON-004",
    donor: "Rohit Menon",
    email: "rohit.menon@meridianhouse.in",
    phone: "+91 98407 55190",
    purpose: "Community",
    amount: 8000,
    mode: "Cash",
    date: "18 Sep 2026",
    time: "2:30 PM",
    status: "Rejected",
    note: "Receipt details incomplete — requested again.",
  },
  {
    code: "DON-005",
    donor: "Priya Nair",
    email: "priya.nair@asterlabs.in",
    phone: "+91 98410 22341",
    purpose: "Community",
    amount: 12000,
    mode: "UPI",
    date: "16 Sep 2026",
    time: "6:20 PM",
    status: "Approved",
    receiptNo: "RCP-7730",
  },
];

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function stampNow() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function useDonations(): DonationRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => donations,
    () => donations,
  );
}

export const donationOf = (code: string) =>
  donations.find((d) => d.code.toLowerCase() === code.trim().toLowerCase());

export function nextDonationCode(): string {
  return `DON-${String(donations.length + 1).padStart(3, "0")}`;
}

export function addDonation(input: {
  donor: string;
  email: string;
  phone: string;
  purpose: DonationPurpose;
  purposeNote?: string;
  amount: number;
  mode: PaymentMode;
}): DonationRecord {
  const { date, time } = stampNow();
  const record: DonationRecord = {
    code: nextDonationCode(),
    donor: input.donor.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    purpose: input.purpose,
    ...(input.purposeNote?.trim() ? { purposeNote: input.purposeNote.trim() } : {}),
    amount: input.amount,
    mode: input.mode,
    date,
    time,
    status: "Pending",
  };
  donations = [record, ...donations];
  emit();
  return record;
}

export function reviewDonation(
  code: string,
  status: "Approved" | "Rejected",
  note?: string,
): DonationRecord | undefined {
  const record = donationOf(code);
  if (!record) return undefined;
  record.status = status;
  if (note?.trim()) record.note = note.trim();
  if (status === "Approved" && !record.receiptNo) {
    record.receiptNo = `RCP-${7742 + donations.indexOf(record)}`;
  }
  emit();
  return record;
}

export const donationTotals = (rows: DonationRecord[]) => {
  const approved = rows.filter((d) => d.status === "Approved");
  return {
    approvedCount: approved.length,
    pendingCount: rows.filter((d) => d.status === "Pending").length,
    rejectedCount: rows.filter((d) => d.status === "Rejected").length,
    approvedAmount: approved.reduce((sum, d) => sum + d.amount, 0),
    totalAmount: rows.reduce((sum, d) => sum + d.amount, 0),
    average: approved.length
      ? Math.round(approved.reduce((sum, d) => sum + d.amount, 0) / approved.length)
      : 0,
  };
};

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
