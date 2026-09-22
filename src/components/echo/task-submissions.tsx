import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CircleUserRound,
  Clock,
  MapPin,
  MessageSquare,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { DataRow, Eyebrow, KpiBand, Modal, PageHeader } from "./primitives";
import { ChecklistGrid, FileTile, SectionBlock, StatusPill } from "./employee-detail";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/echo-data";
import { submissionCounts, submissionReviews, type TaskSubmission } from "@/lib/echo-modules-data";
import { cn } from "@/lib/utils";

/* ---------------- Task Submissions dashboard ---------------- */

export function TaskSubmissionsPage() {
  const all = submissionReviews.flatMap((s) => s.tasks);
  const stats = {
    pending: all.filter((t) => t.review === "Pending Review").length,
    approved: all.filter((t) => t.review === "Approved").length,
    rejected: all.filter((t) => t.review === "Rejected").length,
    today: all.filter((t) => t.submittedOn === "Today").length,
  };

  return (
    <AppShell>
      <PageHeader title="Task Submissions" eyebrow="Work verification" />

      <section data-reveal className="hairline-t mb-14">
        <KpiBand
          items={[
            { label: "Pending Reviews", value: String(stats.pending), note: "Awaiting decision" },
            { label: "Approved Tasks", value: String(stats.approved), note: "Verified & closed" },
            { label: "Rejected Tasks", value: String(stats.rejected), note: "Need re-upload" },
            {
              label: "Completed Today",
              value: String(stats.today),
              note: "Submitted this session",
            },
          ]}
        />
      </section>

      <section data-reveal>
        <div className="mb-8 border-b border-border pb-5">
          <Eyebrow className="mb-3">Employees</Eyebrow>
          <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">
            Submissions by team member
          </h2>
        </div>
        <div className="hidden grid-cols-[1fr_100px_100px_160px] gap-8 border-b border-border py-3 md:grid">
          <span className="eyebrow">Employee</span>
          <span className="eyebrow">Pending</span>
          <span className="eyebrow">Approved</span>
          <span className="eyebrow text-right">Last Submission</span>
        </div>
        <div>
          {employees.map((e) => {
            const c = submissionCounts(e.id);
            return (
              <Link
                key={e.id}
                to="/submissions/$employeeId"
                params={{ employeeId: e.id }}
                className="group grid gap-2 border-b border-border py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[1fr_100px_100px_160px] md:items-center md:gap-8"
              >
                <span className="flex items-center gap-4">
                  <CircleUserRound className="size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block text-[15px] text-foreground">{e.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {e.id} · {e.role}
                    </span>
                  </span>
                </span>
                <span className="text-warning">{c.pending}</span>
                <span className="text-success">{c.approved}</span>
                <span className="text-sm text-muted-foreground md:text-right">{c.last}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

/* ---------------- Employee submission timeline ---------------- */

export function EmployeeSubmissionTimelinePage({ employeeId }: { employeeId: string }) {
  const employee = employees.find((e) => e.id === employeeId) ?? employees[0]!;
  const set = submissionReviews.find((s) => s.employeeId === employee.id);
  const tasks = [...(set?.tasks ?? [])].sort((a, b) => b.id - a.id);

  return (
    <AppShell>
      <PageHeader
        title={employee.name}
        eyebrow="Submission timeline"
        back={{ to: "/submissions", label: "Task Submissions" }}
      />

      <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Every task assigned to {employee.name} with uploaded evidence, listed chronologically. Open
        a task to verify its requirements and files.
      </p>

      <div>
        {tasks.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No submissions on record yet.
          </p>
        )}
        {tasks.map((task) => (
          <Link
            key={task.id}
            to="/submissions/$employeeId/$taskId"
            params={{ employeeId: employee.id, taskId: String(task.id) }}
            className="group flex items-center justify-between border-b border-border py-6 transition-opacity duration-500 hover:opacity-70"
          >
            <span className="flex items-baseline gap-6">
              <span className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">
                Task #{task.id}
              </span>
              <span>
                <span className="block text-[15px] text-foreground md:text-base">{task.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {task.date} · {task.submittedOn}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-6">
              <StatusPill status={task.review} />
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-luxury group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

/* ---------------- Task review page ---------------- */

function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  return (
    <div>
      <div className="mb-6 border-b border-border pb-5">
        <Eyebrow className="mb-3">Comparison</Eyebrow>
        <h3 className="glyph-serif text-2xl text-foreground">Before &amp; After</h3>
      </div>
      <div className="relative h-64 w-full select-none overflow-hidden border border-border bg-surface md:h-80">
        <div className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(45deg,var(--surface)_0,var(--surface)_12px,var(--surface-strong)_12px,var(--surface-strong)_24px)]">
          <span className="text-center">
            <span className="glyph-serif block text-2xl text-foreground/30">Before</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">
              31 Mar 2026 · 3.1 MB
            </span>
          </span>
        </div>
        <div
          className="absolute inset-0 overflow-hidden bg-[repeating-linear-gradient(-45deg,var(--surface-strong)_0,var(--surface-strong)_14px,#15151614_14px,#15151614_28px)]"
          style={{ width: `${pos}%` }}
        >
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-center">
              <span className="glyph-serif block text-2xl text-foreground">After</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                22 Sep 2026 · 2.9 MB
              </span>
            </span>
          </div>
        </div>
        <div className="absolute inset-y-0 w-px bg-foreground/60" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background text-foreground">
            <RefreshCcw className="size-3.5" />
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare before and after"
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none opacity-0"
        />
      </div>
    </div>
  );
}

export function TaskReviewPage({ employeeId, taskId }: { employeeId: string; taskId: string }) {
  const employee = employees.find((e) => e.id === employeeId) ?? employees[0]!;
  const set = submissionReviews.find((s) => s.employeeId === employee.id);
  const task = set?.tasks.find((t) => t.id === Number(taskId));
  const [review, setReview] = useState<TaskSubmission["review"] | undefined>(task?.review);
  const [note, setNote] = useState(task?.note);
  const [confirm, setConfirm] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const verdict = review ?? task?.review;

  if (!task) {
    return (
      <AppShell>
        <PageHeader
          title="Task not found"
          eyebrow="Submission review"
          back={{ to: "/submissions", label: "Task Submissions" }}
        />
        <p className="py-16 text-center text-sm text-muted-foreground">
          This submission is no longer available.
        </p>
      </AppShell>
    );
  }

  const decide = (v: TaskSubmission["review"], message: string) => {
    setReview(v);
    setConfirm(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <PageHeader
        title={`Task #${task.id}`}
        eyebrow="Submission review"
        back={{
          to: "/submissions/$employeeId",
          params: { employeeId: employee.id },
          label: `${employee.name} — timeline`,
        }}
      />

      {confirm && (
        <div
          data-reveal
          className="mb-10 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface px-5 py-4"
        >
          <span className="flex items-center gap-3 text-[15px] text-foreground">
            <CheckCircle2 className="size-4 text-success" />
            {confirm} The employee&apos;s history has been updated automatically.
          </span>
          <Button variant="ghost" size="sm" onClick={() => setConfirm("")}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="mb-16">
        <SectionBlock eyebrow="Task information" title="Assignment detail">
          <DetailRows task={task} employee={employee.name} />
        </SectionBlock>
      </div>

      <div className="mb-16">
        <SectionBlock eyebrow="Completion checklist" title="Required uploads">
          <ChecklistGrid checklist={task.checklist} />
        </SectionBlock>
      </div>

      <div className="mb-16">
        <SectionBlock eyebrow="Uploaded files" title="Evidence">
          <div className="grid gap-12">
            {task.files.filter((f) => f.kind === "Before" || f.kind === "After").length === 2 && (
              <BeforeAfterSlider />
            )}
            {(() => {
              const photos = task.files.filter((f) => f.kind === "Photo");
              return photos.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <Eyebrow className="mb-3">Gallery</Eyebrow>
                    <h3 className="glyph-serif text-2xl text-foreground">
                      Photos ({photos.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
                    {photos.map((f, i) => (
                      <div key={f.label} className="bg-background">
                        <FileTile file={f} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            <div className="grid gap-4 md:grid-cols-2">
              {task.files
                .filter((f) => f.kind !== "Photo" && f.kind !== "Before" && f.kind !== "After")
                .map((f, i) => (
                  <FileTile key={`${f.kind}-${i}`} file={f} index={i} />
                ))}
            </div>
          </div>
        </SectionBlock>
      </div>

      <div className="mb-16">
        <SectionBlock eyebrow="Admin actions" title="Decision">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => decide("Approved", "Task approved.")}
              className={verdict === "Approved" ? "bg-success text-background" : ""}
            >
              <ThumbsUp className="size-4" /> Approve Task
            </Button>
            <Button
              variant="destructive"
              onClick={() => decide("Rejected", "Task rejected.")}
              className={
                verdict === "Rejected" ? "!bg-destructive !text-destructive-foreground" : ""
              }
            >
              <ThumbsDown className="size-4" /> Reject Task
            </Button>
            <Button variant="secondary" onClick={() => setNoteOpen(true)}>
              <RefreshCcw className="size-4" /> Request Re-upload
            </Button>
            <Button variant="secondary" onClick={() => setNoteOpen(true)}>
              <MessageSquare className="size-4" /> Leave Internal Note
            </Button>
          </div>
          <div className="mt-10 max-w-2xl">
            <Eyebrow className="mb-4">Current status</Eyebrow>
            <div className="border border-border bg-surface px-5 py-4">
              <StatusPill status={verdict ?? "Pending Review"} />
              {note && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{note}</p>}
            </div>
          </div>
        </SectionBlock>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Internal note"
        eyebrow="Submission review"
      >
        <textarea
          value={note ?? ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note or ask the employee to re-upload…"
          className="min-h-32 w-full resize-y border-b border-border bg-transparent py-3 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </Modal>
    </AppShell>
  );
}

function DetailRows({ task, employee }: { task: TaskSubmission; employee: string }) {
  const rows: Array<[string, string]> = [
    ["Task Name", task.title],
    ["Client Name", task.client],
    ["Assigned Employee", employee],
    ["Date", task.date],
    ["Check-in Time", task.checkIn],
    ["Check-out Time", task.checkOut],
    ["Narrative", task.narrative],
  ];
  return (
    <div>
      {rows.map(([k, v]) => (
        <DataRow key={k}>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            {k === "Date" ? (
              <Calendar className="size-3.5" />
            ) : k.includes("Time") ? (
              <Clock className="size-3.5" />
            ) : k === "Narrative" ? (
              <MapPin className="size-3.5" />
            ) : null}
            {k}
          </span>
          <span
            className={cn(
              "text-[15px] text-foreground md:text-right",
              k === "Narrative" && "max-w-xl justify-self-end leading-relaxed",
            )}
          >
            {v}
          </span>
        </DataRow>
      ))}
    </div>
  );
}
