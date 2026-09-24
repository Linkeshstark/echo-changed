import { useSyncExternalStore } from "react";
import { employees } from "./echo-data";

/* ---------------- Voucher model (mirrors the Employee Portal) ---------------- */

export type VoucherReason =
  | "Late"
  | "Permission Request"
  | "Leave Request"
  | "Unexpected"
  | "Advance Request"
  | "Other";

export const voucherReasons: VoucherReason[] = [
  "Late",
  "Permission Request",
  "Leave Request",
  "Unexpected",
  "Advance Request",
  "Other",
];

export type VoucherStatus = "Pending" | "Approved" | "Disapproved";

export interface VoucherEvent {
  at: string;
  text: string;
}

export interface VoucherRecord {
  code: string;
  employeeId: string;
  reason: VoucherReason;
  customReason?: string;
  date: string;
  time: string;
  amount?: string;
  description: string;
  submittedAt: string;
  status: VoucherStatus;
  adminNote?: string;
  timeline: VoucherEvent[];
}

/* ---------------- Reactive store (single source, shared by all views) ---------------- */

let vouchers: VoucherRecord[] = [];
let photos: Record<string, string> = {};
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const event = (at: string, text: string): VoucherEvent => ({ at, text });

function seedVoucher(partial: Omit<VoucherRecord, "timeline"> & { timeline?: VoucherEvent[] }): VoucherRecord {
  return { ...partial, timeline: partial.timeline ?? [event(partial.submittedAt, "Voucher submitted by " + nameOf(partial.employeeId) + ".")] };
}

function nameOf(employeeId: string) {
  return employees.find((e) => e.id === employeeId)?.name ?? employeeId;
}

vouchers = [
  seedVoucher({
    code: "VCH-8801",
    employeeId: "E-1042",
    reason: "Leave Request",
    date: "24 Sep 2026",
    time: "9:20 AM",
    description:
      "Applied for 2 days of casual leave on 26–27 Sep for a family function in Thanjavur.",
    submittedAt: "24 Sep 2026 — 9:20 AM",
    status: "Pending",
  }),
  seedVoucher({
    code: "VCH-8793",
    employeeId: "E-1042",
    reason: "Permission Request",
    date: "23 Sep 2026",
    time: "2:05 PM",
    description:
      "Requested 2-hour field permission to attend a family medical appointment at Apollo OMR Clinic.",
    submittedAt: "23 Sep 2026 — 2:05 PM",
    status: "Approved",
    adminNote: "Approved by Operations Director. Normal check-in resumed at 4:35 PM.",
    timeline: [
      event("23 Sep 2026 — 2:05 PM", "Voucher submitted by Arjun Mehta."),
      event("23 Sep 2026 — 2:40 PM", "Reviewed by Admin."),
      event("23 Sep 2026 — 2:40 PM", "Approved."),
    ],
  }),
  seedVoucher({
    code: "VCH-8770",
    employeeId: "E-1042",
    reason: "Late",
    date: "22 Sep 2026",
    time: "9:22 AM",
    description:
      "Unscheduled road closure and utility pipeline repair at Guindy junction caused a 22 minute transit delay.",
    submittedAt: "22 Sep 2026 — 9:22 AM",
    status: "Pending",
  }),
  seedVoucher({
    code: "VCH-8804",
    employeeId: "E-1078",
    reason: "Advance Request",
    date: "23 Sep 2026",
    time: "11:40 AM",
    amount: "₹3,500",
    description:
      "Requested an advance towards the monthly home-loan EMI deduction scheduling with payroll.",
    submittedAt: "23 Sep 2026 — 11:40 AM",
    status: "Approved",
    adminNote: "Approved. Amount will be adjusted across the next two pay cycles.",
    timeline: [
      event("23 Sep 2026 — 11:40 AM", "Voucher submitted by Maya Iyer."),
      event("23 Sep 2026 — 12:10 PM", "Reviewed by Admin."),
      event("23 Sep 2026 — 12:10 PM", "Approved."),
    ],
  }),
  seedVoucher({
    code: "VCH-8788",
    employeeId: "E-1078",
    reason: "Unexpected",
    date: "22 Sep 2026",
    time: "4:12 PM",
    description:
      "Sudden cardiac emergency at home required an immediate hospital visit; reported as soon as connectivity permitted.",
    submittedAt: "22 Sep 2026 — 4:12 PM",
    status: "Pending",
  }),
  seedVoucher({
    code: "VCH-8764",
    employeeId: "E-1078",
    reason: "Other",
    customReason: "Reimbursement of courier charges",
    date: "19 Sep 2026",
    time: "10:00 AM",
    amount: "₹620",
    description:
      "Paid out-of-pocket for urgent ODC courier to Aster Labs during the accounting close.",
    submittedAt: "19 Sep 2026 — 10:00 AM",
    status: "Approved",
    adminNote: "Reimbursement approved against the submitted receipt.",
    timeline: [
      event("19 Sep 2026 — 10:00 AM", "Voucher submitted by Maya Iyer."),
      event("19 Sep 2026 — 10:25 AM", "Reviewed by Admin."),
      event("19 Sep 2026 — 10:25 AM", "Approved."),
    ],
  }),
  seedVoucher({
    code: "VCH-8812",
    employeeId: "E-1121",
    reason: "Late",
    date: "22 Sep 2026",
    time: "9:15 AM",
    description: "Overslept after a late-night service call; reached site at 9:12 AM.",
    submittedAt: "22 Sep 2026 — 9:15 AM",
    status: "Disapproved",
    adminNote: "Oversleeping is not a valid off-limit reason; routine late policy applies.",
    timeline: [
      event("22 Sep 2026 — 9:15 AM", "Voucher submitted by Dev Kumar."),
      event("22 Sep 2026 — 9:50 AM", "Reviewed by Admin."),
      event("22 Sep 2026 — 9:50 AM", "Disapproved."),
    ],
  }),
  seedVoucher({
    code: "VCH-8781",
    employeeId: "E-1121",
    reason: "Leave Request",
    date: "21 Sep 2026",
    time: "8:30 AM",
    description: "Two days of earned leave next week for vehicle registration work.",
    submittedAt: "21 Sep 2026 — 8:30 AM",
    status: "Pending",
  }),
  seedVoucher({
    code: "VCH-8755",
    employeeId: "E-1121",
    reason: "Advance Request",
    date: "17 Sep 2026",
    time: "9:45 AM",
    amount: "₹2,000",
    description: "Advance for fuel top-up covering the south-corridor service route.",
    submittedAt: "17 Sep 2026 — 9:45 AM",
    status: "Disapproved",
    adminNote: "Fuel advances are not offered; fuel is billed directly against the service vehicle.",
    timeline: [
      event("17 Sep 2026 — 9:45 AM", "Voucher submitted by Dev Kumar."),
      event("17 Sep 2026 — 10:15 AM", "Reviewed by Admin."),
      event("17 Sep 2026 — 10:15 AM", "Disapproved."),
    ],
  }),
  seedVoucher({
    code: "VCH-8799",
    employeeId: "E-1150",
    reason: "Permission Request",
    date: "23 Sep 2026",
    time: "3:30 PM",
    description:
      "Requesting a half-day work-from-home on Thursday for a scheduled bank appointment.",
    submittedAt: "23 Sep 2026 — 3:30 PM",
    status: "Pending",
  }),
  seedVoucher({
    code: "VCH-8750",
    employeeId: "E-1150",
    reason: "Other",
    customReason: "Client dinner reimbursement",
    date: "16 Sep 2026",
    time: "12:05 PM",
    amount: "₹1,850",
    description: "Hosted the Meridian House client dinner to close the annual renewal; principal allowed.",
    submittedAt: "16 Sep 2026 — 12:05 PM",
    status: "Approved",
    adminNote: "Approved against the policy limit for client engagement.",
    timeline: [
      event("16 Sep 2026 — 12:05 PM", "Voucher submitted by Sara Khan."),
      event("16 Sep 2026 — 12:40 PM", "Reviewed by Admin."),
      event("16 Sep 2026 — 12:40 PM", "Approved."),
    ],
  }),
];

/* ---------------- Selectors ---------------- */

export function getVouchers(): VoucherRecord[] {
  return vouchers;
}

export function getVouchersOf(employeeId: string): VoucherRecord[] {
  return vouchers.filter((v) => v.employeeId === employeeId);
}

export function getVoucher(code: string): VoucherRecord | undefined {
  return vouchers.find((v) => v.code === code);
}

export function useVouchers(): VoucherRecord[] {
  return useSyncExternalStore(subscribe, () => vouchers, () => vouchers);
}

export function employeeOfVoucher(employeeId: string) {
  return employees.find((e) => e.id === employeeId) ?? employees[0]!;
}

/* ---------------- Admin review actions ---------------- */

export function reviewVoucher(code: string, status: "Approved" | "Disapproved", note?: string) {
  const now = new Date();
  const at =
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " — " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  vouchers = vouchers.map((v) => {
    const reviewed = event(at, "Reviewed by Admin.");
    const result = event(at, status === "Approved" ? "Approved." : "Disapproved.");
    if (v.code !== code) return v;
    const updated: VoucherRecord = {
      ...v,
      status,
      timeline: [...v.timeline, reviewed, result],
    };
    const trimmed = note?.trim();
    if (trimmed) updated.adminNote = trimmed;
    return updated;
  });
  emit();
}

/* ---------------- Profile photos (admin-managed) ---------------- */

export function getPhotos(): Record<string, string> {
  return photos;
}

export function photoOf(employeeId: string): string | undefined {
  return photos[employeeId];
}

export function usePhotos(): Record<string, string> {
  return useSyncExternalStore(subscribe, () => photos, () => photos);
}

export function setPhoto(employeeId: string, dataUrl: string) {
  photos = { ...photos, [employeeId]: dataUrl };
  emit();
}

export function removePhoto(employeeId: string) {
  const next = { ...photos };
  delete next[employeeId];
  photos = next;
  emit();
}