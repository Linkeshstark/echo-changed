import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Eye,
  ListChecks,
  Repeat,
  XCircle,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { Eyebrow, PageHeader } from "./primitives";
import { SectionBlock, StatusPill } from "./employee-detail";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/echo-data";
import {
  employeeNameOfTaskTracking,
  employeeStatusOfTaskTracking,
  regularTasksOf,
  regularTaskStatus,
  regularTasksSummary,
  scheduleDisplay,
  scheduleSummary,
  type RegularTaskAssignment,
  type RegularTaskMissedEntry,
  type RegularTaskOccurrence,
} from "@/lib/echo-task-tracking-data";
import { cn } from "@/lib/utils";

/* ---------------- State tones ---------------- */

const stateTone: Record<string, string> = {
  Completed: "text-success",
  Missed: "text-destructive",
  Pending: "text-warning",
  NotScheduled: "text-muted-foreground/60",
};

const taskTone: Record<string, string> = {
  Daily: "text-foreground",
  Weekly: "text-foreground",
  Monthly: "text-foreground",
};

/* ---------------- Tracking — list of an employee's regular tasks ---------------- */

export function RegularTasksPage({ employeeId }: { employeeId: string }) {
  const tasks = regularTasksOf(employeeId);
  const summary = regularTasksSummary(employeeId);
  const x = employeeStatusOfTaskTracking(employeeId);

  return (
    <AppShell>
      <PageHeader
        title={`${employeeNameOfTaskTracking(employeeId)} — Regular Tasks`}
        eyebrow="Recurring responsibility"
        back={{ to: "/monitor/$employeeId", params: { employeeId }, label: "Employee Monitor" }}
      />

      <section data-reveal className="hairline-t mb-10 flex flex-wrap gap-x-16 gap-y-8 pb-10">
        <div>
          <p className="eyebrow mb-2">Completion</p>
          <p className="glyph-serif text-4xl text-foreground">
            {summary.completionRate.toFixed(0)}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.completed} of {summary.completed + summary.missed} finished
          </p>
        </div>
        <div>
          <p className="eyebrow mb-2">Active Tasks</p>
          <p className="glyph-serif text-4xl text-foreground">{summary.totalTasks}</p>
          <p className="mt-1 text-sm text-muted-foreground">On the register</p>
        </div>
        <div>
          <p className="eyebrow mb-2">This Week</p>
          <p className="glyph-serif text-4xl text-foreground">{summary.weekLabel}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">This Month</p>
          <p className="glyph-serif text-4xl text-foreground">{summary.monthLabel}</p>
        </div>
      </section>

      {tasks.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No regular tasks are scheduled for this employee.
        </p>
      ) : (
        <div>
          <div className="hidden grid-cols-[60px_1fr_150px_200px_150px_120px] gap-6 border-b border-border py-3 lg:grid">
            <span className="eyebrow">No.</span>
            <span className="eyebrow">Task</span>
            <span className="eyebrow">Frequency</span>
            <span className="eyebrow">Schedule</span>
            <span className="eyebrow">Status</span>
            <span className="eyebrow text-right">Action</span>
          </div>
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} employeeId={employeeId} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TaskRow({
  task,
  index,
  employeeId,
}: {
  task: RegularTaskAssignment;
  index: number;
  employeeId: string;
}) {
  const status = regularTaskStatus(employeeId, task.id);
  return (
    <div className="grid gap-4 border-b border-border py-5 lg:grid-cols-[60px_1fr_150px_200px_150px_120px] lg:items-center lg:gap-6">
      <span className="text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <div className="min-w-0">
        <p className="truncate text-[15px] text-foreground">{task.title}</p>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{task.description}</p>
      </div>
      <span className={cn("text-sm uppercase tracking-[0.14em]", taskTone[task.frequency])}>
        {task.frequency}
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
        <Repeat className="size-3.5" /> {scheduleSummary(task)}
      </span>
      <div className="flex flex-wrap items-center gap-x- sosyal gap-2">
        <StatusPill status={task.status} />
        <span
          className={cn(
            "text-sm tabular-nums",
            stateTone[status.occurrences.length ? "Pending" : "NotScheduled"],
          )}
        >
          {status.completionRate.toFixed(0)}%
        </span>
      </div>
      <span className="flex justify-end lg:justify-start">
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/monitor/$employeeId/regular-tasks/$taskId"
            params={{ employeeId, taskId: task.id }}
          >
            <Eye className="size-4" /> View Details
          </Link>
        </Button>
      </span>
    </div>
  );
}

/* ---------------- Tracking — a single regular task's history ---------------- */

export function RegularTaskDetailPage({
  employeeId,
  taskId,
}: {
  employeeId: string;
  taskId: string;
}) {
  const status = regularTaskStatus(employeeId, taskId);
  const task = status.task;
  const initials = employeeNameOfTaskTracking(employeeId)
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <AppShell>
      <PageHeader
        title={task.title}
        eyebrow="Regular task"
        back={{
          to: "/monitor/$employeeId/regular-tasks",
          params: { employeeId },
          label: "Regular Tasks",
        }}
      />

      <section data-reveal className="mb-12 border-b border-border pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center border border-border bg-surface">
              <span className="glyph-serif text-lg">{initials}</span>
            </div>
            <div>
              <p className="text-[15px] text-foreground">
                {employeeNameOfTaskTracking(employeeId)}
              </p>
              <p className="text-sm text-muted-foreground">
                {task.frequency} · assigned {task.assignedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={task.status} />
            <span className={cn("text-sm tabular-nums text-foreground")}>
              {status.completionRate.toFixed(0)}% rate
            </span>
          </div>
        </div>
      </section>

      <div className="mb-12 grid gap-6 md:grid-cols-4">
        <MiniStat label="Scheduled" value={String(status.totalScheduled)} />
        <MiniStat label="Completed" value={String(status.completed)} />
        <MiniStat label="Missed" value={String(status.missed)} />
        <MiniStat label="Pending" value={String(status.pending)} />
      </div>

      <SectionBlock eyebrow="Schedule" title="When this repeats">
        <div className="grid gap-x-16 lg:grid-cols-2">
          <div className="flex items-start gap-Error">
            <Repeat className="mt-1 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">{scheduleSummary(task)}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {scheduleDisplay(task).map((s) => (
                  <li
                    key={s}
                    className="hairline-border rounded-full px-3 py-1 text-xs text-muted-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="Expected time" title="Daily check-in window">
        <p className="text-2xl text-foreground">{task.expectedTime}</p>
      </SectionBlock>

      <SectionBlock eyebrow="Occurrence log" title="How the last weeks went">
        {status.occurrences.length === 0 ? (
          <p className="py-10 text-sm text-muted-foreground">
            No occurrences in the tracking window.
          </p>
        ) : (
          <div>
            <div className="hidden grid-cols-[96px_64px_1fr_130px_110px] gap-6 border-b border-border py-3 lg:grid">
              <span className="eyebrow">Week</span>
              <span className="eyebrow">Day</span>
              <span className="eyebrow">Occurrence</span>
              <span className="eyebrow">When</span>
              <span className="eyebrow text-right">State</span>
            </div>
            {status.occurrences.map((o) => (
              <OccurrenceRow key={o.iso} o={o} />
            ))}
          </div>
        )}
      </SectionBlock>

      {status.missedEntries.length > 0 && (
        <SectionBlock eyebrow="Missed" title="Days that slipped">
          <div>
            <div className="hidden grid-cols-[120px_1fr_130px_1fr] gap-6 border-b border-border py-3 lg:grid">
              <span className="eyebrow">Date</span>
              <span className="eyebrow">Task</span>
              <span className="eyebrow">Expected</span>
              <span className="eyebrow">Reason</span>
            </div>
            {status.missedEntries.map((m) => (
              <MissedRow key={m.iso} m={m} />
            ))}
          </div>
        </SectionBlock>
      )}

      {status.history.length > 0 && (
        <SectionBlock eyebrow="History" title="Completed & missed">
          <ul className="space-y-0">
            {status.history.map((h) => (
              <li
                key={`${h.iso}-${h.title}`}
                className="hairline-b flex items-center justify-between gap-6 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{h.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{h.label}</p>
                </div>
                <StatusPill status={h.state} />
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}
    </AppShell>
  );
}

function OccurrenceRow({ o }: { o: RegularTaskOccurrence }) {
  const weekLabel = o.date.slice(0, 6);
  return (
    <div className="grid gap-3 border-b border-border py-4 lg:grid-cols-[96px_64px_1fr_130px_110px] lg:items-center lg:gap-6">
      <span className="text-xs tabular-nums text-muted-foreground">{o.date}</span>
      <span className="text-sm text-foreground">{o.dayName}</span>
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("size-1.5 rounded-full", stateDot(o.state))} />
        <span className={cn("text-foreground", stateTone[o.state])}>{o.state}</span>
        {o.completedAt && (
          <span className="hidden text-xs tabular-nums md:inline">{o.completedAt}</span>
        )}
      </span>
      <span className="text-sm tabular-nums text-muted-foreground">{o.expectedTime}</span>
      <span className="flex justify-end text-sm text-foreground lg:justify-start">
        <StatusPill status={o.state === "NotScheduled" ? "Inactive" : o.state} />
      </span>
    </div>
  );
}

function MissedRow({ m }: { m: RegularTaskMissedEntry }) {
  return (
    <div className="grid gap-3 border-b border-border py-4 lg:grid-cols-[120px_1fr_130px_1fr] lg:items-center lg:gap-6">
      <span className="text-sm text-foreground">{m.date}</span>
      <span className="text-sm text-muted-foreground">{m.taskTitle}</span>
      <span className="text-sm tabular-nums text-muted-foreground">{m.expectedTime}</span>
      <span className="text-sm text-muted-foreground">{m.reason ?? "—"}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hairline-t pt-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="glyph-serif mt-1 text-3xl text-foreground">{value}</p>
    </div>
  );
}

const stateDot = (state: string) =>
  state === "Completed"
    ? "bg-success"
    : state === "Missed"
      ? "bg-destructive"
      : state === "Pending"
        ? "bg-warning"
        : "bg-muted-foreground/40";

/* ---------------- unused symbol guard (keeps tree-shaken imports honest) ---------------- */

void BadgeCheck;
void BarChart2;
void CalendarDays;
void ClipboardCheck;
void Clock;
void ListChecks;
void XCircle;
