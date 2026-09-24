import { extendedOf } from "./echo-modules-data";
import { employees } from "./echo-data";

/*
 * Regular Task tracking — reads straight from the recurring-task scheduling
 * model used when creating an employee (Daily / Weekly / Monthly with the
 * same weekday + date + pattern semantics). Completion history is recorded
 * per scheduled day so Employee Monitor → Regular Tasks can show who is
 * actually completing their recurring responsibilities.
 */

export type RegularTaskFrequency = "Daily" | "Weekly" | "Monthly";

export interface RegularTaskSchedule {
  daysPerWeek: number;
  weekdays: string[];
  daysPerMonth: number;
  monthDates: number[];
  pattern: string;
}

export interface RegularTaskAssignment {
  id: string;
  title: string;
  description: string;
  frequency: RegularTaskFrequency;
  assignedDate: string;
  status: "Active" | "Inactive";
  expectedTime: string;
  missedIso?: string[];
  reasonByIso?: Record<string, string>;
  schedule: RegularTaskSchedule;
}

export type CompletionState = "Completed" | "Missed" | "Pending" | "NotScheduled";

export interface RegularTaskOccurrence {
  date: string;
  iso: string;
  day: number;
  dayName: string;
  expectedTime: string;
  state: CompletionState;
  completedAt?: string;
  reason?: string;
}

export interface OccurrenceStats {
  scheduled: number;
  completed: number;
  missed: number;
  pending: number;
  rate: number;
}

export interface RegularTaskStatus {
  task: RegularTaskAssignment;
  occurrences: RegularTaskOccurrence[];
  totalScheduled: number;
  completed: number;
  missed: number;
  pending: number;
  completionRate: number;
  week: OccurrenceStats;
  month: OccurrenceStats;
  missedEntries: RegularTaskMissedEntry[];
  history: RegularTaskHistoryEntry[];
}

export interface RegularTaskMissedEntry {
  taskId: string;
  taskTitle: string;
  date: string;
  iso: string;
  dayName: string;
  expectedTime: string;
  status: string;
  reason?: string;
}

export interface RegularTaskHistoryEntry {
  label: string;
  date: string;
  iso: string;
  title: string;
  state: "Completed" | "Missed";
}

export interface RegularTasksEmployeeSummary {
  totalTasks: number;
  completed: number;
  missed: number;
  completionRate: number;
  weekLabel: string;
  monthLabel: string;
}

/* ---------------- Calendar constants (fixed, deterministic mock window) ---------------- */

export const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const TODAY_ISO = "2026-09-23";
export const MONTH_START_ISO = "2026-09-01";
export const MONTH_END_ISO = "2026-09-30";
export const MONTH_DAYS = 30;
export const THIS_WEEK_ISOS = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27"];

/* Monday 24 Aug -> Sunday 30 Sep, so history precedes the current month. */
const WINDOW_DAYS = (() => {
  const days: Array<{ iso: string; day: number; dayName: string }> = [];
  const augStart = 24;
  for (let d = augStart; d <= 31; d += 1) {
    days.push({
      iso: `2026-08-${String(d).padStart(2, "0")}`,
      day: d,
      dayName: isoToDayName(`2026-08-${String(d).padStart(2, "0")}`),
    });
  }
  for (let d = 1; d <= MONTH_DAYS; d += 1) {
    days.push({
      iso: `2026-09-${String(d).padStart(2, "0")}`,
      day: d,
      dayName: isoToDayName(`2026-09-${String(d).padStart(2, "0")}`),
    });
  }
  return days;
})();

function isoToDayName(iso: string) {
  const [, m, dstr] = iso.split("-");
  const date = new Date(Date.UTC(2026, Number(m) - 1, Number(dstr)));
  return WEEKDAY_NAMES[(date.getUTCDay() + 6) % 7]!;
}

function dayNameOf(d: number) {
  return isoToDayName(`2026-09-${String(d).padStart(2, "0")}`);
}

function displayDate(iso: string) {
  const [, month, dayStr] = iso.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(dayStr)} ${months[Number(month)]} ${iso.slice(0, 4)}`;
}

const ordinal = (n: number) => {
  if (n >= 11 && n <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

/* ---------------- Seed data (mirrors Create New Employee → Regular daily tasks) ---------------- */

const byEmployee: Record<string, RegularTaskAssignment[]> = {
  "E-1121": [
    {
      id: "RT-101",
      title: "Morning Site Inspection",
      description: "Walk the Aster Labs site and confirm every operational area is secured and hazard-free before the workday begins.",
      frequency: "Daily",
      assignedDate: "01 Sep 2026",
      status: "Active",
      expectedTime: "09:00 AM",
      missedIso: ["2026-09-02", "2026-09-17"],
      reasonByIso: {
        "2026-09-17": "Vehicle breakdown on the way to site; logged a separate note in the morning handover.",
      },
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
    {
      id: "RT-102",
      title: "Equipment Check",
      description: "Verify service kit, safety gear and test equipment are in working order ahead of the week's field visits.",
      frequency: "Weekly",
      assignedDate: "01 Sep 2026",
      status: "Active",
      expectedTime: "09:15 AM",
      missedIso: ["2026-09-14"],
      reasonByIso: {
        "2026-09-14": "Client visit at Nova Warehouse ran long and overlapped the scheduled check window.",
      },
      schedule: { daysPerWeek: 2, weekdays: ["Monday", "Thursday"], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
    {
      id: "RT-103",
      title: "Monthly Inventory",
      description: "Reconcile spare parts and consumables stock levels against the service register and flag shortages.",
      frequency: "Monthly",
      assignedDate: "01 Sep 2026",
      status: "Active",
      expectedTime: "10:00 AM",
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 2, monthDates: [5, 20], pattern: "" },
    },
  ],
  "E-1042": [
    {
      id: "RT-201",
      title: "Shift Handover Log",
      description: "Update the field team handover log with pending items, equipment status and follow-ups before close of shift.",
      frequency: "Daily",
      assignedDate: "20 Aug 2026",
      status: "Active",
      expectedTime: "08:30 AM",
      missedIso: ["2026-09-09"],
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
    {
      id: "RT-202",
      title: "Team Standup Briefing",
      description: "Run the morning standup with the field crew and record commitments for the day.",
      frequency: "Weekly",
      assignedDate: "20 Aug 2026",
      status: "Active",
      expectedTime: "08:45 AM",
      missedIso: ["2026-09-11"],
      schedule: { daysPerWeek: 3, weekdays: ["Tuesday", "Thursday", "Friday"], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
  ],
  "E-1078": [
    {
      id: "RT-301",
      title: "Invoice Reconciliation",
      description: "Match the week's client invoices against payment receipts and flag any variance.",
      frequency: "Weekly",
      assignedDate: "24 Aug 2026",
      status: "Active",
      expectedTime: "11:30 AM",
      missedIso: ["2026-09-18"],
      reasonByIso: {
        "2026-09-18": "Closed for the quarterly audit meeting; rescheduled to Monday.",
      },
      schedule: { daysPerWeek: 3, weekdays: ["Monday", "Wednesday", "Friday"], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
    {
      id: "RT-302",
      title: "Vendor Statement Review",
      description: "Review open vendor statements and confirm month-end accruals with the accounts team.",
      frequency: "Monthly",
      assignedDate: "24 Aug 2026",
      status: "Active",
      expectedTime: "03:00 PM",
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "15th of every month" },
    },
  ],
  "E-1150": [
    {
      id: "RT-401",
      title: "Client Check-in Calls",
      description: "Place daily check-in calls to priority clients and log open items in the account tracker.",
      frequency: "Daily",
      assignedDate: "24 Aug 2026",
      status: "Active",
      expectedTime: "10:00 AM",
      missedIso: ["2026-09-05"],
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "" },
    },
    {
      id: "RT-402",
      title: "Account Review Meeting",
      description: "Monthly review of client account health, outstanding invoices and renewal risks.",
      frequency: "Monthly",
      assignedDate: "24 Aug 2026",
      status: "Active",
      expectedTime: "02:30 PM",
      schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "1st Monday of every month" },
    },
  ],
};

const patternDatesInSeptember = (pattern: string): number[] => {
  const dates: number[] = [];
  const nths = new Map([
    ["1st", 0],
    ["2nd", 1],
    ["3rd", 2],
    ["4th", 3],
  ]);
  const lastOf = pattern.startsWith("Last");
  const nth = lastOf ? -1 : (nths.get(pattern.split(" ")[0]!) ?? 0);
  const weekday = pattern.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/)?.[1];
  if (weekday) {
    if (lastOf) {
      for (let d = MONTH_DAYS; d >= 1; d -= 1) {
        if (dayNameOf(d) === weekday) {
          dates.push(d);
          break;
        }
      }
      return dates;
    }
    let seen = 0;
    for (let d = 1; d <= MONTH_DAYS; d += 1) {
      if (dayNameOf(d) === weekday) {
        if (seen === nth) {
          dates.push(d);
          break;
        }
        seen += 1;
      }
    }
    return dates;
  }
  const dayOfMonth = Number(pattern.split(" ")[0]!.replace(/[^0-9]/g, ""));
  if (Number.isFinite(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= MONTH_DAYS) {
    dates.push(dayOfMonth);
  }
  return dates;
};

/* ---------------- Occurrence generation ---------------- */

function occursOn(day: number, dayName: string, task: RegularTaskAssignment): boolean {
  const s = task.schedule;
  if (task.frequency === "Daily") return true;
  if (task.frequency === "Weekly") return s.weekdays.includes(dayName);
  if (s.pattern) return patternDatesInSeptember(s.pattern).includes(day);
  return s.monthDates.includes(day);
}

function stateOf(iso: string, task: RegularTaskAssignment): CompletionState {
  if (iso > TODAY_ISO) return "Pending";
  return task.missedIso?.includes(iso) ? "Missed" : "Completed";
}

function occurrencesOf(task: RegularTaskAssignment): RegularTaskOccurrence[] {
  return WINDOW_DAYS.filter((d) => occursOn(d.day, d.dayName, task)).map((d) => {
    const state = stateOf(d.iso, task);
    return {
      date: displayDate(d.iso),
      iso: d.iso,
      day: d.day,
      dayName: d.dayName,
      expectedTime: task.expectedTime,
      state,
      ...(state === "Completed" ? { completedAt: task.expectedTime } : {}),
      ...(state === "Missed" && task.reasonByIso?.[d.iso]
        ? { reason: task.reasonByIso![d.iso] }
        : {}),
    };
  });
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function statsOf(occ: RegularTaskOccurrence[]): OccurrenceStats {
  const completed = occ.filter((o) => o.state === "Completed").length;
  const missed = occ.filter((o) => o.state === "Missed").length;
  const pending = occ.filter((o) => o.state === "Pending").length;
  const scheduled = completed + missed;
  return { scheduled, completed, missed, pending, rate: scheduled ? (completed / scheduled) * 100 : 0 };
}

export function regularTasksOf(employeeId: string): RegularTaskAssignment[] {
  return byEmployee[employeeId] ?? [];
}

export function regularTaskStatus(employeeId: string, taskId: string): RegularTaskStatus {
  const task = regularTasksOf(employeeId).find((t) => t.id === taskId);
  const fallback: RegularTaskAssignment = {
    id: taskId,
    title: "Untitled regular task",
    description: "",
    frequency: "Daily",
    assignedDate: "—",
    status: "Inactive",
    expectedTime: "—",
    schedule: { daysPerWeek: 0, weekdays: [], daysPerMonth: 0, monthDates: [], pattern: "" },
  };
  const active = task ?? fallback;
  const occurrences = occurrencesOf(active);
  const completed = sum(occurrences.map((o) => (o.state === "Completed" ? 1 : 0)));
  const missed = sum(occurrences.map((o) => (o.state === "Missed" ? 1 : 0)));
  const pending = sum(occurrences.map((o) => (o.state === "Pending" ? 1 : 0)));
  const weekOcc = occurrences.filter((o) => THIS_WEEK_ISOS.includes(o.iso));
  const monthOcc = occurrences.filter((o) => o.iso >= MONTH_START_ISO && o.iso <= MONTH_END_ISO);
  const past = occurrences.filter((o) => o.iso <= TODAY_ISO);
  const missedEntries: RegularTaskMissedEntry[] = past
    .filter((o) => o.state === "Missed")
    .map((o) => ({
      taskId: active.id,
      taskTitle: active.title,
      date: o.date,
      iso: o.iso,
      dayName: o.dayName,
      expectedTime: o.expectedTime,
      status: "Missed",
      ...(o.reason ? { reason: o.reason } : {}),
    }));
  const history: RegularTaskHistoryEntry[] = past
    .filter((o) => o.state === "Completed" || o.state === "Missed")
    .sort((a, b) => (a.iso < b.iso ? 1 : -1))
    .map((o) => ({
      label: `${o.date} — ${o.completedAt ?? o.expectedTime}`,
      date: o.date,
      iso: o.iso,
      title: active.title,
      state: o.state === "Missed" ? "Missed" : "Completed",
    }));
  return {
    task: active,
    occurrences,
    totalScheduled: occurrences.length,
    completed,
    missed,
    pending,
    completionRate: completed + missed ? (completed / (completed + missed)) * 100 : 0,
    week: statsOf(weekOcc),
    month: statsOf(monthOcc),
    missedEntries,
    history,
  };
}

export function regularTasksSummary(employeeId: string): RegularTasksEmployeeSummary {
  const tasks = regularTasksOf(employeeId);
  let completed = 0;
  let missed = 0;
  let weekScheduled = 0;
  let weekCompleted = 0;
  let weekMissed = 0;
  let monthScheduled = 0;
  let monthCompleted = 0;
  let monthMissed = 0;
  for (const task of tasks) {
    const occ = occurrencesOf(task).filter((o) => o.iso <= TODAY_ISO);
    const weekOcc = occ.filter((o) => THIS_WEEK_ISOS.includes(o.iso));
    const monthOcc = occ.filter((o) => o.iso >= MONTH_START_ISO);
    completed += sum(occ.map((o) => (o.state === "Completed" ? 1 : 0)));
    missed += sum(occ.map((o) => (o.state === "Missed" ? 1 : 0)));
    weekScheduled += weekOcc.length;
    weekCompleted += sum(weekOcc.map((o) => (o.state === "Completed" ? 1 : 0)));
    weekMissed += sum(weekOcc.map((o) => (o.state === "Missed" ? 1 : 0)));
    monthScheduled += monthOcc.length;
    monthCompleted += sum(monthOcc.map((o) => (o.state === "Completed" ? 1 : 0)));
    monthMissed += sum(monthOcc.map((o) => (o.state === "Missed" ? 1 : 0)));
  }
  const rate = completed + missed ? (completed / (completed + missed)) * 100 : 0;
  const weekRate = weekScheduled ? (weekCompleted / weekScheduled) * 100 : 0;
  const monthRate = monthScheduled ? (monthCompleted / monthScheduled) * 100 : 0;
  return {
    totalTasks: tasks.length,
    completed,
    missed,
    completionRate: rate,
    weekLabel: `${weekScheduled} of ${weekScheduled > 0 ? weekScheduled + weekMissed : 0} scheduled · ${weekRate.toFixed(0)}%`,
    monthLabel: `${monthCompleted + monthMissed} scheduled · ${monthRate.toFixed(0)}%`,
  };
}

export function scheduleDisplay(task: RegularTaskAssignment): string[] {
  const s = task.schedule;
  if (task.frequency === "Daily") return ["Every day"];
  if (task.frequency === "Weekly") {
    return [`${s.daysPerWeek} ${s.daysPerWeek === 1 ? "day" : "days"} per week`, ...(s.weekdays.length ? s.weekdays : [])];
  }
  if (s.pattern) return ["1 day per month", s.pattern];
  const dates = s.monthDates.slice().sort((a, b) => a - b);
  return [`${dates.length} ${dates.length === 1 ? "day" : "days"} per month`, ...dates.map(ordinal)];
}

export function scheduleSummary(task: RegularTaskAssignment): string {
  if (task.frequency === "Daily") return "Daily";
  if (task.frequency === "Weekly") {
    return `Weekly · ${task.schedule.daysPerWeek} ${task.schedule.daysPerWeek === 1 ? "day" : "days"}/week · ${task.schedule.weekdays.join(", ")}`;
  }
  const s = task.schedule;
  if (s.pattern) return `Monthly · ${s.pattern}`;
  const dates = s.monthDates.slice().sort((a, b) => a - b);
  return `Monthly · ${dates.length} ${dates.length === 1 ? "day" : "days"}/month · ${dates
    .map(ordinal)
    .join(", ")}`;
}

export const employeeNameOfTaskTracking = (employeeId: string) =>
  employees.find((e) => e.id === employeeId)?.name ?? employeeId;

export const employeeStatusOfTaskTracking = (employeeId: string) => {
  try {
    return extendedOf(employeeId).status;
  } catch {
    return "Active";
  }
};