/*
 * Notifications — a small reactive store so a notification opened from the bell stays
 * marked as read after navigating away. Every page mounts its own AppShell, so the read
 * state lives here rather than inside the bell. Mock data only.
 */

import { useSyncExternalStore } from "react";

export type NotificationIcon =
  | "task"
  | "voucher"
  | "maintenance"
  | "activity"
  | "donation"
  | "payroll"
  | "employee"
  | "client"
  | "chat"
  | "submission";

/**
 * Where a notification leads. Discriminated on `to` so the router keeps each
 * destination's param and search types while the records live outside the router.
 */
export type NotificationTarget =
  | {
      to: "/monitor/$employeeId";
      params: { employeeId: string };
      search: { tab: string | undefined; task: string | undefined };
    }
  | { to: "/raised-voucher/$voucherCode"; params: { voucherCode: string } }
  | { to: "/maintenance/$code"; params: { code: string } }
  | { to: "/raised-activity/$code"; params: { code: string } }
  | { to: "/donation/$code"; params: { code: string } }
  | {
      to: "/payroll/$employeeId";
      params: { employeeId: string };
      search: { month: string | undefined };
    }
  | { to: "/employees/$employeeId"; params: { employeeId: string } }
  | { to: "/clients/$clientName"; params: { clientName: string } }
  | { to: "/chats/$groupId"; params: { groupId: string } }
  | { to: "/submissions/$employeeId/$taskId"; params: { employeeId: string; taskId: string } };

export type Notification = {
  id: string;
  icon: NotificationIcon;
  title: string;
  detail: string;
  at: string;
  read: boolean;
  target: NotificationTarget;
};

const READ_KEY = "echo-notifications-read";

let notifications: Notification[] = [
  {
    id: "n-task",
    icon: "task",
    title: "New task assigned to Arjun Mehta",
    detail: "Nova Retail duct audit · due 24 Sep 2026",
    at: "2 min ago",
    read: false,
    target: {
      to: "/monitor/$employeeId",
      params: { employeeId: "E-1042" },
      search: { tab: "Tasks", task: "22" },
    },
  },
  {
    id: "n-voucher",
    icon: "voucher",
    title: "Voucher request submitted by Arjun Mehta",
    detail: "VCH-8801 · Leave Request · Pending",
    at: "15 min ago",
    read: false,
    target: { to: "/raised-voucher/$voucherCode", params: { voucherCode: "VCH-8801" } },
  },
  {
    id: "n-maintenance",
    icon: "maintenance",
    title: "Maintenance schedule created for Aster Labs",
    detail: "MNT-005 · Rooftop cooling tower inspection",
    at: "1 hour ago",
    read: true,
    target: { to: "/maintenance/$code", params: { code: "MNT-005" } },
  },
  {
    id: "n-activity",
    icon: "activity",
    title: "Raised Activity RA-002 updated",
    detail: "Pump problem · Meridian House · In Progress",
    at: "3 hours ago",
    read: false,
    target: { to: "/raised-activity/$code", params: { code: "RA-002" } },
  },
  {
    id: "n-donation",
    icon: "donation",
    title: "Donation awaiting approval",
    detail: "DON-002 · Vikram Desai · ₹15,000 · UPI",
    at: "Today",
    read: true,
    target: { to: "/donation/$code", params: { code: "DON-002" } },
  },
  {
    id: "n-payroll",
    icon: "payroll",
    title: "Payroll updated for September",
    detail: "Arjun Mehta · ₹59,000 · Paid",
    at: "Yesterday",
    read: true,
    target: {
      to: "/payroll/$employeeId",
      params: { employeeId: "E-1042" },
      search: { month: "Sep" },
    },
  },
  {
    id: "n-employee",
    icon: "employee",
    title: "New employee created",
    detail: "Sara Khan · E-1150 · Client Success",
    at: "Yesterday",
    read: true,
    target: { to: "/employees/$employeeId", params: { employeeId: "E-1150" } },
  },
  {
    id: "n-client",
    icon: "client",
    title: "New client added",
    detail: "Arc Systems · CL-0004 · Arc Manufacturing Systems",
    at: "2 days ago",
    read: true,
    target: { to: "/clients/$clientName", params: { clientName: "Arc Systems" } },
  },
  {
    id: "n-chat",
    icon: "chat",
    title: "Group chat message received",
    detail: "ABC Residential · 3 unread messages",
    at: "2 days ago",
    read: true,
    target: { to: "/chats/$groupId", params: { groupId: "abc-residential" } },
  },
  {
    id: "n-submission",
    icon: "submission",
    title: "Task submission received",
    detail: "Aster Labs site inspection · Pending Review",
    at: "3 days ago",
    read: true,
    target: {
      to: "/submissions/$employeeId/$taskId",
      params: { employeeId: "E-1042", taskId: "21" },
    },
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

const persist = () => {
  try {
    const read = notifications.filter((n) => n.read).map((n) => n.id);
    localStorage.setItem(READ_KEY, JSON.stringify(read));
  } catch {
    /* storage unavailable — read state still holds for the session */
  }
};

/** Opens a notification: marks it read, then the caller navigates to its target. */
export function markRead(id: string) {
  const target = notifications.find((n) => n.id === id);
  if (!target || target.read) return;
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  persist();
  emit();
}

/** Re-applies the ids kept from an earlier visit. Call once the client has mounted. */
export function restoreRead() {
  let saved: unknown;
  try {
    saved = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
  } catch {
    return;
  }
  if (!Array.isArray(saved) || saved.length === 0) return;
  const ids = new Set(saved as string[]);
  if (notifications.every((n) => n.read || !ids.has(n.id))) return;
  notifications = notifications.map((n) => (ids.has(n.id) ? { ...n, read: true } : n));
  emit();
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(
    subscribe,
    () => notifications,
    () => notifications,
  );
}
