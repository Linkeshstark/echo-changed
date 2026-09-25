import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Download,
  FileText,
  Folder,
  Hourglass,
  Shield,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { AssignedActivities, RaisedActivityEvents } from "./raised-activity";
import { Eyebrow, KpiBand, Modal, PageHeader, SelectField } from "./primitives";
import { ProfilePhotoBox, VouchersTab } from "./vouchers";
import { CallButton, CallablePhone } from "./call-button";
import {
  DetailRows,
  downloadTextFile,
  EntryRow,
  FileTile,
  MiniTrend,
  SectionBlock,
  StatusPill,
  StickyActions,
  TabBar,
} from "./employee-detail";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/echo-data";
import {
  extendedEmployees,
  extendedOf,
  finalPayable,
  inr,
  payroll,
  payrollOf,
  submissionReviews,
  type AssignedTask,
  type EmployeeExtended,
  type UploadedFile,
} from "@/lib/echo-modules-data";
import { deductionsOf, useDeductions } from "@/lib/echo-advances";
import {
  assignedActivitiesForEmployee,
  averageSatisfaction,
  employeeNameOf,
} from "@/lib/echo-ops-data";
import { SatisfactionReadout } from "./satisfaction";
import { cn } from "@/lib/utils";

/* ---------------- Employee Monitor dashboard ---------------- */

export function MonitorPage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [designation, setDesignation] = useState("All");

  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))), []);
  const designations = useMemo(() => Array.from(new Set(employees.map((e) => e.role))), []);

  const visible = extendedEmployees.filter((x) => {
    const text =
      `${x.employee.name} ${x.employee.id} ${x.employee.role} ${x.employee.department}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (department === "All" || x.employee.department === department) &&
      (designation === "All" || x.employee.role === designation) &&
      (status === "All" || x.status === status)
    );
  });

  const inProgress = extendedEmployees.reduce(
    (sum, x) => sum + x.assignedTasks.filter((t) => t.status === "In Progress").length,
    0,
  );
  const pendingReviews = submissionReviews.reduce(
    (sum, s) => sum + s.tasks.filter((t) => t.review === "Pending Review").length,
    0,
  );
  const payrollPending = payroll.filter((p) => p.status === "Pending").length;

  return (
    <AppShell>
      <PageHeader title="Employee Monitor" eyebrow="People operations" />

      <section data-reveal className="hairline-t mb-14">
        <KpiBand
          items={[
            { label: "Total Employees", value: String(employees.length), note: "On the register" },
            {
              label: "Active Today",
              value: String(extendedEmployees.filter((x) => x.status !== "On Leave").length),
              note: "Checked in or working",
            },
            {
              label: "On Leave",
              value: String(extendedEmployees.filter((x) => x.status === "On Leave").length),
              note: "Approved absence",
            },
            { label: "Tasks In Progress", value: String(inProgress), note: "Across all teams" },
            {
              label: "Pending Reviews",
              value: String(pendingReviews),
              note: "Submissions to verify",
            },
            { label: "Payroll Pending", value: String(payrollPending), note: "Payouts due" },
          ]}
        />
      </section>

      {/* Filters */}
      <div
        data-reveal
        className="grid gap-x-12 gap-y-8 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="relative lg:col-span-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee, ID, role…"
            className="h-12 w-full border-b border-border bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <SelectField
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="All">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectField>
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          <option>Working</option>
          <option>Active</option>
          <option>On Leave</option>
        </SelectField>
        <SelectField
          label="Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        >
          <option value="All">All designations</option>
          {designations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectField>
      </div>

      {/* Numbered directory */}
      <div className="hidden grid-cols-[64px_1fr_1fr_160px_120px] gap-8 border-b border-border py-3 md:grid">
        <span className="eyebrow">No.</span>
        <span className="eyebrow">Employee</span>
        <span className="eyebrow">Department</span>
        <span className="eyebrow">Status</span>
        <span className="eyebrow text-right">Action</span>
      </div>
      <div>
        {visible.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No employees match the filters.
          </p>
        )}
        {visible.map((x, i) => (
          <div
            key={x.employee.id}
            className="grid gap-2 border-b border-border py-5 md:grid-cols-[64px_1fr_1fr_160px_120px] md:items-center md:gap-8"
          >
            <span className="text-xs tabular-nums text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block text-[15px] text-foreground">{x.employee.name}</span>
              <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                {x.employee.id} · {x.employee.role}
                <CallButton phone={x.phone} name={x.employee.name} />
              </span>
            </span>
            <span className="text-sm text-muted-foreground">{x.employee.department}</span>
            <span>
              <StatusPill status={x.status} />
            </span>
            <span className="justify-self-end">
              <Button asChild size="sm" variant="secondary">
                <Link
                  to="/monitor/$employeeId"
                  params={{ employeeId: x.employee.id }}
                  search={{ tab: undefined, task: undefined }}
                >
                  View Details <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

/* ---------------- Monitor employee profile ---------------- */

const tabs = [
  "Overview",
  "Tasks",
  "Submissions",
  "Attendance",
  "Payroll",
  "Advances",
  "Leave",
  "Documents",
  "Performance",
  "Vouchers",
];

const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarLegend: Record<string, string> = {
  P: "bg-success",
  A: "bg-destructive",
  L: "bg-warning",
  W: "bg-muted",
  F: "bg-muted/30",
};

const taskTone: Record<string, string> = {
  Pending: "text-warning",
  "In Progress": "text-warning",
  "Waiting Review": "text-warning",
  Approved: "text-success",
  Rejected: "text-destructive",
};

function GroupedFiles({ files }: { files: UploadedFile[] }) {
  const before = files.filter((f) => f.kind === "Before");
  const after = files.filter((f) => f.kind === "After");
  const photos = files.filter((f) => f.kind === "Photo");
  const video = files.filter((f) => f.kind === "Video");
  const voice = files.filter((f) => f.kind === "Voice");
  const signature = files.filter((f) => f.kind === "Signature");
  const mark = files.filter((f) => f.kind === "Mark");

  const group = (label: string, items: UploadedFile[]) =>
    items.length === 0 ? null : (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Eyebrow className="!mb-0">{label}</Eyebrow>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <div key={`${label}-${i}`} className="bg-background">
              <FileTile file={f} index={i} />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      {group("Before Photos", before)}
      {group("After Photos", after)}
      {group("Voice Reply", voice)}
      {group("Additional Photos", photos)}
      {group("Video", video)}
      {group("Signature", signature)}
      {group("Mark", mark)}
    </div>
  );
}

function OverviewTab({ x }: { x: EmployeeExtended }) {
  return (
    <div data-reveal className="grid gap-10 lg:grid-cols-2">
      <DetailRows
        rows={[
          ["Phone Number", <CallablePhone key="phone" phone={x.phone} name={x.employee.name} />],
          ["Email", x.email],
          ["Aadhaar (masked)", x.aadhaarMasked],
          ["PAN (masked)", x.panMasked],
          ["Bank Details (masked)", x.bankMasked],
          ["IFSC", x.ifsc],
          ["Salary", inr(x.payroll.monthly)],
        ]}
      />
      <DetailRows
        rows={[
          ["Agreement Start", x.agreementStart],
          ["Agreement End", x.agreementEnd],
          ["Current Active Task", x.currentActiveTask],
          ["Next Scheduled Task", x.nextScheduledTask],
          ["Last Completed Task", x.lastCompletedTask],
        ]}
      />
    </div>
  );
}

function TaskRow({
  task,
  x,
  highlight,
}: {
  task: AssignedTask;
  x: EmployeeExtended;
  highlight?: boolean;
}) {
  const linked = submissionReviews
    .find((s) => s.employeeId === x.employee.id)
    ?.tasks.some((t) => t.id === task.id);
  const row = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (highlight) row.current?.scrollIntoView({ block: "center" });
  }, [highlight]);
  const setRow = (node: HTMLElement | null) => {
    row.current = node;
  };
  const inner = (
    <>
      <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
        Task #{task.id}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] text-foreground">{task.title}</span>
        <span className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>{task.client}</span>
          <span>Due {task.due}</span>
          <span>In {task.checkIn}</span>
          <span>Out {task.checkOut}</span>
        </span>
      </span>
    </>
  );
  const shared = cn(
    "flex items-center gap-6 border-b border-border py-5 transition-opacity duration-500 last:border-b-0",
    linked && "cursor-pointer hover:opacity-70",
    highlight && "bg-accent/10",
  );
  return linked ? (
    <Link
      to="/submissions/$employeeId/$taskId"
      params={{ employeeId: x.employee.id, taskId: String(task.id) }}
      className={shared}
      ref={setRow}
    >
      {inner}
      <span className="ml-auto flex items-center gap-6">
        <span className={taskTone[task.status] ?? "text-muted-foreground"}>{task.status}</span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      </span>
    </Link>
  ) : (
    <div className={shared} ref={setRow}>
      {inner}
      <span className={cn("ml-auto", taskTone[task.status] ?? "text-muted-foreground")}>
        {task.status}
      </span>
    </div>
  );
}

function SubmissionsTab({ x }: { x: EmployeeExtended }) {
  const set = submissionReviews.find((s) => s.employeeId === x.employee.id);
  if (!set || set.tasks.length === 0) {
    return <p className="py-10 text-sm text-muted-foreground">No submissions on record.</p>;
  }
  return (
    <div data-reveal className="space-y-14">
      {set.tasks.map((t) => (
        <div key={t.id} className="border-b border-border pb-2 last:border-b-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Eyebrow className="mb-2">Task #{t.id}</Eyebrow>
              <h3 className="glyph-serif text-2xl text-foreground">{t.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {t.client} · {t.date} · {t.checkIn} — {t.checkOut}
              </p>
            </div>
            <StatusPill status={t.review} />
          </div>
          {t.narrative && (
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t.narrative}
            </p>
          )}
          {t.satisfaction?.rating ? (
            <div className="mb-6">
              <Eyebrow className="mb-3">Client satisfaction</Eyebrow>
              <SatisfactionReadout satisfaction={t.satisfaction} />
            </div>
          ) : null}
          <GroupedFiles files={t.files} />
        </div>
      ))}
    </div>
  );
}

function AttendanceTab({ x }: { x: EmployeeExtended }) {
  const calendar: ("P" | "A" | "L" | "W" | "F")[] = [];
  for (let d = 1; d <= 30; d++) {
    const wd = new Date(2026, 8, d).getDay();
    if (wd === 0 || wd === 6) calendar.push("W");
    else if (x.attendance.absent.includes(d)) calendar.push("A");
    else if (x.attendance.late.includes(d)) calendar.push("L");
    else if (x.attendance.present.includes(d)) calendar.push("P");
    else calendar.push("F");
  }
  const present = calendar.filter((d) => d === "P").length;
  const absent = calendar.filter((d) => d === "A").length;
  const late = calendar.filter((d) => d === "L").length;
  const trailingCells = (7 - (31 % 7)) % 7;
  return (
    <div data-reveal className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <Eyebrow className="mb-3">September 2026</Eyebrow>
          <h3 className="glyph-serif text-2xl text-foreground">Monthly attendance</h3>
        </div>
        <div className="grid grid-cols-7 gap-px border border-border bg-border">
          {weekday.map((d) => (
            <div
              key={d}
              className="bg-background px-2 py-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              {d}
            </div>
          ))}
          <div className="bg-background px-2 py-2" />
          {calendar.map((day, i) => (
            <div
              key={i}
              className={cn(
                "grid h-14 place-items-center border-none bg-background text-xs tabular-nums text-foreground/70",
              )}
            >
              <span className="relative grid size-8 place-items-center">
                {i + 1}
                <span
                  className={cn("absolute bottom-1 size-1 rounded-full", calendarLegend[day])}
                />
              </span>
            </div>
          ))}
          {Array.from({ length: trailingCells }).map((_, i) => (
            <div key={`e${i}`} className="bg-background" />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" /> Present
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-destructive" /> Absent
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-warning" /> Late
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-muted" /> Weekend
          </span>
        </div>
      </div>
      <DetailRows
        rows={[
          ["Present Days", String(present)],
          ["Absent Days", String(absent)],
          ["Late Check-ins", String(late)],
          ["Working Hours", `${x.attendance.hours} hrs`],
          ["Today's Check-in", x.attendance.checkInToday],
          ["Today's Check-out", x.attendance.checkOutToday],
        ]}
      />
    </div>
  );
}

function PayrollTab({ x }: { x: EmployeeExtended }) {
  const record = payrollOf(x.employee.id);
  return (
    <div data-reveal className="grid gap-12 lg:grid-cols-2">
      <DetailRows
        rows={[
          ["Monthly Salary", inr(x.payroll.monthly)],
          ["Bonuses", `+ ${inr(x.payroll.bonuses)}`],
          ["Deductions", `− ${inr(x.payroll.deductions)}`],
          ["Advance Deductions", `− ${inr(x.payroll.advanceDeductions)}`],
          ["Final Salary", inr(finalPayable(record))],
        ]}
      />
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <Eyebrow className="mb-3">Salary history</Eyebrow>
          <h3 className="glyph-serif text-2xl text-foreground">Paid months</h3>
        </div>
        <div className="hidden grid-cols-[1fr_120px_100px] gap-6 border-b border-border py-3 md:grid">
          <span className="eyebrow">Month</span>
          <span className="eyebrow text-right">Amount</span>
          <span className="eyebrow text-right">Status</span>
        </div>
        <div>
          {record.history.map((h) => (
            <div
              key={h.month}
              className="grid gap-2 border-b border-border py-4 md:grid-cols-[1fr_120px_100px] md:items-center md:gap-6"
            >
              <span className="text-[15px] text-foreground">{h.month}</span>
              <span className="text-[15px] text-foreground md:text-right">{inr(h.amount)}</span>
              <span className="flex justify-end">
                <StatusPill status={h.status} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link
              to="/payroll/$employeeId"
              params={{ employeeId: x.employee.id }}
              search={{ month: undefined }}
            >
              <Wallet className="size-4" /> Pay Salary
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdvancesTab({ x }: { x: EmployeeExtended }) {
  useDeductions();
  const cuts = deductionsOf(x.employee.id);
  const totalAdv = x.advances.reduce((s, a) => s + a.amount, 0);
  const remaining = x.advances
    .filter((a) => a.status === "Pending")
    .reduce((s, a) => s + a.amount, 0);
  return (
    <div data-reveal className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <DetailRows
        rows={[
          ["Total Advances", inr(totalAdv)],
          ["Remaining Recovery", inr(remaining)],
        ]}
      />
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <Eyebrow className="mb-3">Advance history</Eyebrow>
          <h3 className="glyph-serif text-2xl text-foreground">Recoveries</h3>
        </div>
        <div className="hidden grid-cols-[1fr_120px_120px] gap-6 border-b border-border py-3 md:grid">
          <span className="eyebrow">Date</span>
          <span className="eyebrow text-right">Amount</span>
          <span className="eyebrow text-right">Status</span>
        </div>
        <div>
          {x.advances.map((a) => (
            <div
              key={`${a.date}-${a.amount}`}
              className="grid gap-2 border-b border-border py-4 md:grid-cols-[1fr_120px_120px] md:items-center md:gap-6"
            >
              <span className="text-[15px] text-foreground">{a.date}</span>
              <span className="text-[15px] text-foreground md:text-right">{inr(a.amount)}</span>
              <span className="flex justify-end">
                <StatusPill status={a.status === "Deducted" ? "Approved" : a.status} />
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="mb-6 border-b border-border pb-4">
            <Eyebrow className="mb-3">Update Salary</Eyebrow>
            <h3 className="glyph-serif text-2xl text-foreground">Deductions</h3>
          </div>
          <div className="hidden grid-cols-[1fr_120px_120px] gap-6 border-b border-border py-3 md:grid">
            <span className="eyebrow">Date</span>
            <span className="eyebrow text-right">Amount</span>
            <span className="eyebrow text-right">Status</span>
          </div>
          <div>
            {cuts.length === 0 && (
              <p className="py-6 text-sm text-muted-foreground">No deductions on record.</p>
            )}
            {cuts.map((d) => (
              <div
                key={`${d.date}-${d.time}-${d.reason}`}
                className="grid gap-2 border-b border-border py-4 md:grid-cols-[1fr_120px_120px] md:items-center md:gap-6"
              >
                <span>
                  <span className="block text-[15px] text-foreground">{d.date}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{d.reason}</span>
                </span>
                <span className="text-[15px] text-foreground md:text-right">{d.amount}</span>
                <span className="flex justify-end">
                  <StatusPill status="Deducted" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveTab({ x }: { x: EmployeeExtended }) {
  return (
    <div data-reveal className="grid gap-12 lg:grid-cols-2">
      <div>
        <DetailRows
          rows={[
            ["Leave Balance", `${x.leave.balance} days remaining`],
            ["Upcoming Approved Leave", x.leave.upcoming],
          ]}
        />
      </div>
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <Eyebrow className="mb-3">Leave history</Eyebrow>
          <h3 className="glyph-serif text-2xl text-foreground">Requests</h3>
        </div>
        <div className="hidden grid-cols-[1fr_1fr_100px] gap-6 border-b border-border py-3 md:grid">
          <span className="eyebrow">Date</span>
          <span className="eyebrow">Reason</span>
          <span className="eyebrow text-right">Status</span>
        </div>
        <div>
          {x.leave.history.map((l) => (
            <div
              key={`${l.date}-${l.reason}`}
              className="grid gap-2 border-b border-border py-4 md:grid-cols-[1fr_1fr_100px] md:items-center md:gap-6"
            >
              <span className="text-[15px] text-foreground">{l.date}</span>
              <span className="text-sm text-muted-foreground">{l.reason}</span>
              <span className="flex justify-end">
                <StatusPill status={l.status} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ x }: { x: EmployeeExtended }) {
  return (
    <div
      data-reveal
      className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
    >
      {x.documents.map((doc) => (
        <div key={doc.folder} className="bg-background p-6">
          <div className="flex items-center justify-between">
            <Folder className="size-5 text-muted-foreground" />
            <Shield className="size-3.5 text-success" />
          </div>
          <h3 className="mt-6 text-sm font-medium text-foreground">{doc.folder}</h3>
          <ul className="mt-3 space-y-1.5">
            {doc.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-3 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PerformanceTab({ x }: { x: EmployeeExtended }) {
  const p = x.performance;
  const employeeName = employeeNameOf(x.employee.id);
  const tasks = submissionReviews.find((s) => s.employeeId === x.employee.id)?.tasks ?? [];
  const activities = employeeName ? assignedActivitiesForEmployee(employeeName) : [];
  const ratedTasks = tasks.filter((t) => t.satisfaction?.rating);
  const ratedActivities = activities.filter((a) => a.satisfaction?.rating);
  const liveAverage = averageSatisfaction([...tasks, ...activities]);
  const satisfactionValue = liveAverage ?? p.satisfaction;
  return (
    <div data-reveal>
      <KpiBand
        items={[
          { label: "Task Completion Rate", value: `${p.completion}%`, note: "vs target 90%" },
          { label: "On-time Completion", value: `${p.onTime}%`, note: "Time-to-close" },
          {
            label: "Client Satisfaction",
            value: `${satisfactionValue} / 5`,
            note: liveAverage ? "From client ratings" : "Rolling average",
          },
          { label: "Attendance Percentage", value: `${p.attendancePct}%`, note: "This month" },
        ]}
      />
      <div className="mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-2">
        <div>
          <div className="mb-5 border-b border-border pb-4">
            <Eyebrow className="mb-3">Trend</Eyebrow>
            <h3 className="glyph-serif text-2xl text-foreground">Tasks completed</h3>
          </div>
          <MiniTrend data={p.tasksTrend} dataKey="tasks" height={56} />
        </div>
        <div>
          <div className="mb-5 border-b border-border pb-4">
            <Eyebrow className="mb-3">Trend</Eyebrow>
            <h3 className="glyph-serif text-2xl text-foreground">Working hours</h3>
          </div>
          <MiniTrend data={p.hoursTrend} dataKey="hours" height={56} />
        </div>
      </div>
      {ratedTasks.length + ratedActivities.length > 0 ? (
        <div className="mt-12">
          <div className="mb-5 border-b border-border pb-4">
            <Eyebrow className="mb-3">Client feedback</Eyebrow>
            <h3 className="glyph-serif text-2xl text-foreground">Satisfaction received</h3>
          </div>
          <div className="grid gap-8">
            {ratedTasks.map((t) => (
              <div key={`task-${t.id}`} className="border-b border-border pb-6">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Task #{t.id} · {t.title}
                </p>
                <SatisfactionReadout satisfaction={t.satisfaction!} />
              </div>
            ))}
            {ratedActivities.map((a) => (
              <div key={`act-${a.code}`} className="border-b border-border pb-6">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {a.ticket} · {a.problem}
                </p>
                <SatisfactionReadout satisfaction={a.satisfaction!} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MonitorEmployeePage({
  employeeId,
  tab,
  task,
}: {
  employeeId: string;
  tab?: string | undefined;
  task?: string | undefined;
}) {
  const x = extendedOf(employeeId);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => (tab && tabs.includes(tab) ? tab : "Overview"));
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const year = new Date().getFullYear() - new Date(x.joinDate).getFullYear();
  const initials = x.employee.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  /* Keeps the tab in the URL so a notification can open a specific tab and record. */
  const setTab = (next: string) => {
    setActiveTab(next);
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, tab: next === "Overview" ? undefined : next }),
      replace: true,
    });
  };

  const report = () =>
    downloadTextFile(
      `employee-report-${x.employee.id}.txt`,
      [
        "ECHO — EMPLOYEE REPORT",
        "======================",
        "",
        `Name        : ${x.employee.name}`,
        `Employee ID : ${x.employee.id}`,
        `Designation : ${x.employee.role}`,
        `Department  : ${x.employee.department}`,
        `Status      : ${x.status}`,
        `Join Date   : ${x.joinDate}`,
        `Salary      : ${inr(x.payroll.monthly)}`,
        "",
        `Active Task : ${x.currentActiveTask}`,
        `Next Task   : ${x.nextScheduledTask}`,
        "",
        "Generated by ECHO Admin Portal.",
      ].join("\n"),
    );

  return (
    <AppShell>
      <PageHeader
        title={x.employee.name}
        eyebrow="Employee Monitor"
        back={{ to: "/monitor", label: "Employee Monitor" }}
      />

      {/* Profile header */}
      <div data-reveal className="mb-12 grid gap-8 md:grid-cols-[220px_1fr]">
        <div>
          <ProfilePhotoBox employeeId={x.employee.id} initials={initials} />
        </div>
        <div>
          <div className="hidden grid-cols-[160px_1fr] gap-6 md:grid">
            <span className="eyebrow">Employee Code</span>
            <span className="text-[15px] text-foreground">{x.employee.id}</span>
            <span className="eyebrow">Designation</span>
            <span className="text-[15px] text-foreground">{x.employee.role}</span>
            <span className="eyebrow">Department</span>
            <span className="text-[15px] text-foreground">{x.employee.department}</span>
            <span className="eyebrow">Current Status</span>
            <span>
              <StatusPill status={x.status} />
            </span>
            <span className="eyebrow">Join Date</span>
            <span className="text-[15px] text-foreground">{x.joinDate}</span>
            <span className="eyebrow">Years Worked</span>
            <span className="text-[15px] text-foreground">{year} years</span>
          </div>
          <div className="mt-6 md:hidden">
            <StatusPill status={x.status} />
            <p className="mt-2 text-xs text-muted-foreground">{x.statusDetail}</p>
          </div>
          <p className="mt-4 hidden text-xs text-muted-foreground md:block">{x.statusDetail}</p>
        </div>
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={setTab} />

      <div className="py-10">
        {activeTab === "Overview" && <OverviewTab x={x} />}
        {activeTab === "Tasks" && (
          <div data-reveal>
            <div className="hidden grid-cols-[64px_1fr_140px] gap-6 border-b border-border py-3 lg:grid">
              <span className="eyebrow">Task</span>
              <span className="eyebrow">Assignment</span>
              <span className="eyebrow text-right">Status</span>
            </div>
            <div>
              {[...x.assignedTasks]
                .sort((a, b) => b.id - a.id)
                .map((t) => (
                  <TaskRow key={t.id} task={t} x={x} highlight={task === String(t.id)} />
                ))}
            </div>
            <AssignedActivities employeeId={x.employee.id} />
          </div>
        )}
        {activeTab === "Submissions" && <SubmissionsTab x={x} />}
        {activeTab === "Attendance" && <AttendanceTab x={x} />}
        {activeTab === "Payroll" && <PayrollTab x={x} />}
        {activeTab === "Advances" && <AdvancesTab x={x} />}
        {activeTab === "Leave" && <LeaveTab x={x} />}
        {activeTab === "Documents" && <DocumentsTab x={x} />}
        {tab === "Performance" && <PerformanceTab x={x} />}
        {tab === "Vouchers" && <VouchersTab employeeId={x.employee.id} />}
      </div>

      {/* Smart timeline */}
      <SectionBlock eyebrow="Smart timeline" title="Unified employee history">
        <div>
          {x.timeline.map((day) => (
            <div key={day.date}>
              <div className="flex items-baseline gap-6 border-b border-border py-5">
                <span className="w-28 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {day.date}
                </span>
                <ul className="space-y-2">
                  {day.events.map((ev, i) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] text-foreground">
                      <span className="size-1 rounded-full bg-muted-foreground/60" />
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <RaisedActivityEvents employeeId={x.employee.id} />
      </SectionBlock>

      {actionMsg && (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-enter bg-foreground px-6 py-3 text-sm text-background">
          {actionMsg}
        </div>
      )}

      <StickyActions>
        <span className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/tasks/new">
              <Briefcase className="size-4" /> Assign New Task
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/advances">
              <UserPlus className="size-4" /> Add Advance
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setLeaveOpen(true)}>
            <CalendarDays className="size-4" /> Mark Leave
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link
              to="/payroll/$employeeId"
              params={{ employeeId: x.employee.id }}
              search={{ month: undefined }}
            >
              <Wallet className="size-4" /> Pay Salary
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/employees/new">
              <BadgeCheck className="size-4" /> Edit Employee
            </Link>
          </Button>
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            report();
            setActionMsg("Employee report downloaded.");
          }}
        >
          <Download className="size-4" /> Download Employee Report
        </Button>
      </StickyActions>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Mark leave"
        eyebrow={x.employee.name}
      >
        <div className="grid gap-9">
          <EntryRow
            right={
              <SelectField label="Type" defaultValue="Half day">
                <option>Half day</option>
                <option>Full day</option>
              </SelectField>
            }
          >
            <span className="flex items-center gap-2">
              <Hourglass className="size-4 text-muted-foreground" /> Leave request (mock)
            </span>
          </EntryRow>
          <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            This preview marks a leave without touching the register. Full leave workflow wiring
            ships with the Worker Portal.
          </p>
        </div>
      </Modal>
    </AppShell>
  );
}
