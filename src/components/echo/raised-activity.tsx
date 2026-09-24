import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FileText,
  Image as ImageIcon,
  MapPin,
  Pause,
  Phone,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { AreaField, Eyebrow, PageHeader, SelectField, TextField } from "./primitives";
import { SectionBlock, StatusPill } from "./employee-detail";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/echo-data";
import {
  activityStatuses,
  assignedActivitiesForEmployee,
  clientProfile,
  currentIssuesForClient,
  employeeNameOf,
  findActivity,
  maintenanceForClient,
  raisedActivities,
  raisedActivityForClient,
  resolvedIssuesForClient,
  updateActivity,
  type ActivityAttachment,
  type ActivityStatus,
  type RaisedActivity,
} from "@/lib/echo-ops-data";
import { cn } from "@/lib/utils";

/* ---------------- Status tones ---------------- */

const activityTone: Record<string, string> = {
  Raised: "text-warning",
  Acknowledged: "text-warning",
  Assigned: "text-warning",
  "In Progress": "text-warning",
  "Awaiting Parts / Information": "text-warning",
  "Work Completed": "text-foreground",
  "Awaiting Admin Verification": "text-warning",
  Resolved: "text-success",
  Closed: "text-muted-foreground",
  Reopened: "text-destructive",
};

const priorityTone: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-warning",
  Low: "text-muted-foreground",
};

export function ActivityStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em]",
        activityTone[status] ?? "text-muted-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ---------------- Voice player (mock playback) ---------------- */

function VoicePlayer({ label, duration }: { label: string; duration?: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          setPlaying(false);
          return 100;
        }
        return next;
      });
    }, 140);
    return () => window.clearInterval(id);
  }, [playing]);

  const seconds = Math.round((progress / 100) * 12);

  return (
    <div className="flex items-center gap-5 border border-border bg-surface px-5 py-4">
      <button
        type="button"
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        onClick={() => {
          if (progress >= 100) setProgress(0);
          setPlaying(!playing);
        }}
        className="grid size-10 shrink-0 place-items-center border border-border text-foreground transition-opacity duration-500 hover:opacity-60"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <span className="truncate text-[15px] text-foreground">{label}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {seconds > 0 ? `0:${String(seconds).padStart(2, "0")}` : "0:00"} / {duration ?? "0:12"}
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-border">
          <div
            className="h-full bg-accent transition-[width] duration-150 ease-luxury"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Attachments ---------------- */

function AttachmentGrid({ attachments }: { attachments: ActivityAttachment[] }) {
  const photos = attachments.filter((a) => a.kind === "Photo");
  const voices = attachments.filter((a) => a.kind === "Voice");
  const docs = attachments.filter((a) => a.kind === "Document");
  return (
    <div className="space-y-8">
      {photos.length > 0 && (
        <div>
          <Eyebrow className="mb-3">Problem photos</Eyebrow>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((p) => (
              <div key={p.label} className="group grid aspect-[4/3] place-items-center bg-surface">
                <span className="px-4 text-center">
                  <ImageIcon className="mx-auto mb-3 size-5 text-muted-foreground" />
                  <span className="block text-[13px] text-foreground">{p.label}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{p.meta}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {voices.length > 0 && (
        <div>
          <Eyebrow className="mb-3">Voice notes</Eyebrow>
          <div className="space-y-3">
            {voices.map((v) => (
              <VoicePlayer
                key={v.label}
                label={v.label}
                {...(v.duration ? { duration: v.duration } : {})}
              />
            ))}
          </div>
        </div>
      )}
      {docs.length > 0 && (
        <div>
          <Eyebrow className="mb-3">Uploaded files</Eyebrow>
          <div className="space-y-3">
            {docs.map((d) => (
              <button
                key={d.label}
                type="button"
                className="flex w-full items-center gap-5 border border-border bg-surface px-5 py-4 text-left transition-opacity duration-500 hover:opacity-60"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-[15px] text-foreground">{d.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{d.meta}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Timeline ---------------- */

function ActivityTimeline({ activity }: { activity: RaisedActivity }) {
  return (
    <div>
      <div className="hidden grid-cols-[120px_220px_1fr_1fr] gap-6 border-b border-border py-3 lg:grid">
        <span className="eyebrow">Time</span>
        <span className="eyebrow">Status</span>
        <span className="eyebrow">Updated By</span>
        <span className="eyebrow">Note</span>
      </div>
      {activity.timeline.map((entry, i) => (
        <div
          key={`${entry.time}-${entry.status}-${i}`}
          className="grid gap-2 border-b border-border py-5 lg:grid-cols-[120px_220px_1fr_1fr] lg:items-center lg:gap-6"
        >
          <span className="text-xs tabular-nums text-muted-foreground">{entry.time}</span>
          <div>
            <ActivityStatusPill status={entry.status} />
          </div>
          <span className="text-sm text-foreground">{entry.updatedBy}</span>
          <span className="text-sm text-muted-foreground">{entry.note ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Raised Activity — list ---------------- */

export function RaisedActivityPage() {
  const open = raisedActivities.filter((a) => !["Resolved", "Closed"].includes(a.status));
  const closedCount = raisedActivities.length - open.length;
  return (
    <AppShell>
      <PageHeader title="Raised Activity" eyebrow="Client service desk" />

      <div className="mb-14 flex flex-wrap gap-8 border-b border-border py-6">
        <div>
          <p className="eyebrow mb-2">Total Raised</p>
          <p className="glyph-serif text-4xl text-foreground">{raisedActivities.length}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Open Issues</p>
          <p className="glyph-serif text-4xl text-foreground">{open.length}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Resolved</p>
          <p className="glyph-serif text-4xl text-foreground">{closedCount}</p>
        </div>
      </div>

      <div className="hidden grid-cols-[48px_120px_1fr_1fr_1fr_130px_110px_150px] gap-6 border-b border-border py-3 lg:grid">
        <span className="eyebrow">No.</span>
        <span className="eyebrow">Code</span>
        <span className="eyebrow">Client</span>
        <span className="eyebrow">Site</span>
        <span className="eyebrow">Problem</span>
        <span className="eyebrow">Time Raised</span>
        <span className="eyebrow">Status</span>
        <span className="eyebrow text-right">Action</span>
      </div>
      <div>
        {raisedActivities.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No activities raised yet.
          </p>
        )}
        {raisedActivities.map((a, i) => (
          <div
            key={a.code}
            className="grid gap-3 border-b border-border py-5 lg:grid-cols-[48px_120px_1fr_1fr_1fr_130px_110px_150px] lg:items-center lg:gap-6"
          >
            <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            <span className="text-[15px] text-foreground">{a.code}</span>
            <Link
              to="/clients/$clientName"
              params={{ clientName: a.client }}
              className={cn(
                "w-max text-[15px] text-foreground",
                clientProfile(a.client).code !== "CL-NEW" &&
                  "transition-opacity duration-500 hover:opacity-60",
              )}
            >
              {a.client}
            </Link>
            <span className="text-sm text-muted-foreground">{a.site}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{a.problem}</span>
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {a.raisedDate}
              <span className="block text-xs">{a.raisedTime}</span>
            </span>
            <div>
              <ActivityStatusPill status={a.status} />
            </div>
            <span className="flex justify-end lg:justify-start">
              <Button asChild size="sm" variant="secondary">
                <Link to="/raised-activity/$code" params={{ code: a.code }}>
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

/* ---------------- Raised Activity — details ---------------- */

export function RaisedActivityDetailsPage({ code }: { code: string }) {
  const activity = useMemo(() => findActivity(code), [code]);
  if (!activity) {
    return (
      <AppShell>
        <PageHeader
          title="Raised Activity Details"
          eyebrow="Client service desk"
          back={{ to: "/raised-activity", label: "Raised Activity" }}
        />
        <p className="py-16 text-sm text-muted-foreground">
          No activity found for code <span className="text-foreground">{code}</span>.
        </p>
      </AppShell>
    );
  }
  const profile = clientProfile(activity.client);
  const priority = priorityTone[activity.priority] ?? "text-muted-foreground";
  return (
    <AppShell>
      <PageHeader
        title="Raised Activity Details"
        eyebrow={activity.code}
        back={{ to: "/raised-activity", label: "Raised Activity" }}
      />

      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <Eyebrow className="mb-3">Current Status</Eyebrow>
          <p className="glyph-serif text-4xl text-foreground md:text-5xl">{activity.status}</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-2 uppercase tracking-[0.16em] text-xs",
              priority,
            )}
          >
            <span className="size-1.5 rounded-full bg-current" /> {activity.priority} priority
          </span>
          {activity.assignee && (
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Assigned to {activity.assignee}
            </span>
          )}
        </div>
      </div>

      <SectionBlock eyebrow="Client information" title="Who raised this">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1fr_1fr]">
          {(
            [
              ["Client Name", activity.client],
              ["Company Name", profile.company],
              ["Client Code", profile.code],
              ["Phone", profile.phone],
              ["Email", profile.email],
              ["GSTIN", profile.gst],
            ] as Array<[string, string]>
          ).map(([k, v]) => (
            <div key={k} className="hairline-b flex items-center justify-between gap-6 py-4">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-[15px] text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="Site information" title="Where the issue is">
        <div className="grid lg:grid-cols-2">
          <div className="flex items-start gap-5 border-b border-border py-4 lg:border-0">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[15px] text-foreground">{activity.site}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activity.siteAddress}</p>
            </div>
          </div>
          <div className="border-b border-border py-4 lg:border-b-0 lg:border-l lg:pl-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Contact</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
              <Phone className="size-3.5" /> {profile.phone}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <Building2 className="size-3.5" /> {profile.company}
            </p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="Complaint information" title="What the client reported">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-2">
          {(
            [
              ["Activity Code", activity.code],
              ["Date Raised", activity.raisedDate],
              ["Time Raised", activity.raisedTime],
              ["Complaint / Problem", activity.problem],
            ] as Array<[string, string]>
          ).map(([k, v]) => (
            <div key={k} className="hairline-b flex items-center justify-between gap-6 py-4">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-right text-[15px] text-foreground">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-8">
          <Eyebrow className="mb-3">Detailed description</Eyebrow>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {activity.description}
          </p>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <Eyebrow className="mb-3">Additional notes</Eyebrow>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {activity.notes || "—"}
          </p>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="Client attachments" title="Evidence submitted">
        {activity.attachments.length ? (
          <AttachmentGrid attachments={activity.attachments} />
        ) : (
          <p className="text-sm text-muted-foreground">No attachments provided.</p>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="Activity timeline" title="Complete issue history">
        <ActivityTimeline activity={activity} />
      </SectionBlock>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link to="/update-activity">
            <CalendarClock className="size-4" /> Update {activity.code}
          </Link>
        </Button>
        <Button asChild>
          <Link to="/raised-activity">Back to Raised Activity</Link>
        </Button>
      </div>
    </AppShell>
  );
}

/* ---------------- Update Raised Activity ---------------- */

export function UpdateActivityPage() {
  const [code, setCode] = useState("");
  const [activity, setActivity] = useState<RaisedActivity | undefined>();
  const [status, setStatus] = useState<ActivityStatus>("Raised");
  const [assignee, setAssignee] = useState("");
  const [manualAssignee, setManualAssignee] = useState("");
  const [note, setNote] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [completionTime, setCompletionTime] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  const find = () => {
    const found = findActivity(code);
    setActivity(found);
    setFeedback(
      found ? `Found ${found.code} — ${found.client}.` : `No activity matches code “${code}”.`,
    );
    if (found) {
      setStatus(found.status);
      setAssignee(found.assignee ?? "");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    const updated = updateActivity(code, {
      status,
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(manualAssignee.trim() || assignee ? { assignee: manualAssignee.trim() || assignee } : {}),
      ...(completionDate || completionTime
        ? { expectedCompletion: { date: completionDate || "—", time: completionTime || "—" } }
        : {}),
      ...(chips.length
        ? { attachments: chips.map((c) => ({ kind: "Document", label: c, meta: "Attachment" })) }
        : {}),
    });
    if (!updated) return;
    setActivity(updated);
    setAssignee(updated.assignee ?? "");
    setFeedback(`Activity ${updated.code} updated — ${updated.status}.`);
    setNote("");
    setChips([]);
  };

  return (
    <AppShell>
      <PageHeader title="Update Raised Activity" eyebrow="Client service desk" />

      <section data-reveal className="hairline-t py-12 md:py-16">
        <Eyebrow className="mb-4">Locate</Eyebrow>
        <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">
          Enter Activity Code
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-64 flex-1">
            <TextField
              label="Activity code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder=" "
              onKeyDown={(e) => e.key === "Enter" && find()}
            />
          </div>
          <Button type="button" size="lg" onClick={find}>
            <Search className="size-4" /> Find Activity
          </Button>
        </div>
        {code && (
          <p className="mt-4 text-xs text-muted-foreground">
            Example codes — RA-001, RA-002, RA-003, RA-004, RA-005
          </p>
        )}
        {feedback && (
          <p className="mt-6 border-t border-border pt-5 text-sm text-foreground">{feedback}</p>
        )}
      </section>

      {activity && (
        <form onSubmit={submit}>
          <section data-reveal className="hairline-t py-12 md:py-16">
            <div className="mb-10 grid gap-8 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
              <div>
                <Eyebrow className="mb-4">Current Status</Eyebrow>
                <h2 className="glyph-serif text-3xl leading-tight text-foreground md:text-4xl">
                  {activity.status}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {activity.problem} — {activity.client} · {activity.site}
                </p>
              </div>
              <div className="grid content-start gap-x-16 gap-y-9 md:grid-cols-2">
                <SelectField
                  label="Change Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                >
                  {activityStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
                <div />
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Assigned employee
                </span>
                <SelectField
                  label="Assign employee"
                  value={manualAssignee ? "" : assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="">Keep current — {activity.assignee ?? "No assignment"}</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Manual assignee"
                  value={manualAssignee}
                  onChange={(e) => setManualAssignee(e.target.value)}
                  maxLength={100}
                />
                <AreaField
                  label="Admin note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1200}
                  className="md:col-span-2"
                />
              </div>
            </div>
          </section>

          <section data-reveal className="hairline-t py-12 md:py-16">
            <div className="mb-10 grid gap-8 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
              <div>
                <Eyebrow className="mb-4">Schedule</Eyebrow>
                <h2 className="glyph-serif text-3xl leading-tight text-foreground md:text-4xl">
                  Expected completion
                </h2>
              </div>
              <div className="grid content-start gap-x-16 gap-y-9 md:grid-cols-2">
                <TextField
                  label="Date"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={completionTime}
                  onChange={(e) => setCompletionTime(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section data-reveal className="hairline-t py-12 md:py-16">
            <div className="mb-10 grid gap-8 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
              <div>
                <Eyebrow className="mb-4">Attachments</Eyebrow>
                <h2 className="glyph-serif text-3xl leading-tight text-foreground md:text-4xl">
                  Admin evidence
                </h2>
              </div>
              <div>
                {chips.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {chips.map((c) => (
                      <div
                        key={c}
                        className="flex items-center justify-between border-b border-border py-3"
                      >
                        <span className="text-sm text-foreground">{c}</span>
                        <button
                          type="button"
                          aria-label="Remove attachment"
                          onClick={() => setChips(chips.filter((x) => x !== c))}
                          className="text-muted-foreground transition-opacity duration-500 hover:opacity-60"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid gap-x-16 gap-y-9 md:grid-cols-3">
                  {["Upload photo", "Upload document"].map((label) => (
                    <label
                      key={label}
                      className="group grid min-h-24 cursor-pointer place-items-center border border-dashed border-border text-center transition-colors duration-500 hover:border-foreground/40"
                    >
                      <span className="block text-sm text-foreground">{label}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setChips([...chips, f.name]);
                        }}
                      />
                    </label>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setChips([...chips, `Admin note ${chips.length + 1}`])}
                  >
                    <Plus className="size-4" /> Add note
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div
            data-reveal
            className="hairline-t flex flex-wrap items-center justify-between gap-4 pb-6 pt-8"
          >
            <span className="max-w-md text-xs text-muted-foreground">
              Every status change creates a new timeline entry. Historical entries are never
              overwritten.
            </span>
            <Button type="submit" size="lg">
              Update Activity
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}

/* ---------------- Shared employee connections ---------------- */

export function AssignedActivities({ employeeId }: { employeeId: string }) {
  const name = employeeNameOf(employeeId);
  const list = name ? assignedActivitiesForEmployee(name) : [];
  if (list.length === 0) return null;
  return (
    <div className="mt-10">
      <div className="mb-8 border-b border-border pb-5">
        <Eyebrow className="mb-3">Raised activity</Eyebrow>
        <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Assigned complaints</h2>
      </div>
      <div>
        {list.map((a) => (
          <div
            key={a.code}
            className="flex items-center justify-between gap-6 border-b border-border py-5"
          >
            <div className="min-w-0">
              <Link
                to="/raised-activity/$code"
                params={{ code: a.code }}
                className="text-[15px] text-foreground transition-opacity duration-500 hover:opacity-60"
              >
                {a.code} — {a.problem}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.client} · {a.site} · {a.raisedTime}, {a.raisedDate}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <ActivityStatusPill status={a.status} />
              <ArrowRight className="size-4 text-muted-foreground/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssignedActivitiesCount({ employeeId }: { employeeId: string }) {
  const name = employeeNameOf(employeeId);
  const count = name ? assignedActivitiesForEmployee(name).length : 0;
  if (count === 0) return null;
  return (
    <div className="mt-8 border-t border-border pt-5">
      <p className="text-sm text-muted-foreground">
        Also assignee for{" "}
        <span className="text-foreground">
          {count} raised {count === 1 ? "activity" : "activities"}
        </span>{" "}
        — open the Tasks tab.
      </p>
    </div>
  );
}

export function RaisedActivityEvents({ employeeId }: { employeeId: string }) {
  const name = employeeNameOf(employeeId);
  const list = name ? assignedActivitiesForEmployee(name) : [];
  if (list.length === 0) return null;
  return (
    <div>
      {list.map((a) => (
        <div key={a.code} className="border-b border-border py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Link
              to="/raised-activity/$code"
              params={{ code: a.code }}
              className="text-[15px] text-foreground transition-opacity duration-500 hover:opacity-60"
            >
              {a.code} — {a.problem}
            </Link>
            <ActivityStatusPill status={a.status} />
          </div>
          <ul className="space-y-2">
            {a.timeline.slice(-3).map((entry, i) => (
              <li
                key={`${a.code}-${entry.time}-${i}`}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="size-1 rounded-full bg-muted-foreground/60" />
                {entry.time} · {entry.status}
                {entry.note && <span className="text-foreground/70">— {entry.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Client portal connection ---------------- */

export function ClientPortalPage({ clientName }: { clientName: string }) {
  const profile = useMemo(() => clientProfile(clientName), [clientName]);
  const raised = raisedActivityForClient(profile.name);
  const current = currentIssuesForClient(profile.name);
  const resolved = resolvedIssuesForClient(profile.name);
  const maintenance = maintenanceForClient(profile.name);

  return (
    <AppShell>
      <PageHeader title={profile.name} eyebrow="Client Portal" />

      <section data-reveal className="hairline-t py-12 md:py-16">
        <Eyebrow className="mb-4">Client information</Eyebrow>
        <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">{profile.company}</h2>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1fr_1fr]">
          {(
            [
              ["Client Code", profile.code],
              ["Company Name", profile.company],
              ["Phone", profile.phone],
              ["Email", profile.email],
              ["Address", profile.address],
              ["GSTIN", profile.gst],
            ] as Array<[string, string]>
          ).map(([k, v]) => (
            <div key={k} className="hairline-b flex items-center justify-between gap-6 py-4">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-right text-[15px] text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <SectionBlock eyebrow="Raised activities" title="Complaints on record">
        {raised.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities raised by this client.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-[100px_1fr_130px_140px] gap-6 border-b border-border py-3 md:grid">
              <span className="eyebrow">Code</span>
              <span className="eyebrow">Problem</span>
              <span className="eyebrow">Raised</span>
              <span className="eyebrow text-right">Status</span>
            </div>
            {raised.map((a) => (
              <div
                key={a.code}
                className="grid gap-2 border-b border-border py-5 md:grid-cols-[100px_1fr_130px_140px] md:items-center md:gap-6"
              >
                <Link
                  to="/raised-activity/$code"
                  params={{ code: a.code }}
                  className="w-max text-[15px] text-foreground transition-opacity duration-500 hover:opacity-60"
                >
                  {a.code}
                </Link>
                <span className="text-sm text-foreground">{a.problem}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {a.raisedTime}, {a.raisedDate}
                </span>
                <div className="flex justify-end">
                  <ActivityStatusPill status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="Maintenance history" title="Work performed for this client">
        {maintenance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No maintenance records yet.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-[90px_1fr_1fr_120px_100px] gap-6 border-b border-border py-3 md:grid">
              <span className="eyebrow">Code</span>
              <span className="eyebrow">Maintenance</span>
              <span className="eyebrow">Employee</span>
              <span className="eyebrow text-right">Date</span>
              <span className="eyebrow text-right">Status</span>
            </div>
            {maintenance.map((m) => (
              <div
                key={m.code}
                className="grid gap-2 border-b border-border py-5 md:grid-cols-[90px_1fr_1fr_120px_100px] md:items-center md:gap-6"
              >
                <span className="text-xs tabular-nums text-muted-foreground">{m.code}</span>
                <span className="text-[15px] text-foreground">{m.what}</span>
                <span className="text-sm text-muted-foreground">{m.employee}</span>
                <span className="text-sm tabular-nums text-muted-foreground md:text-right">
                  {m.date}
                </span>
                <div className="flex justify-end">
                  <StatusPill status={m.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="Issues breakout" title="Current vs resolved">
        <div className="grid gap-x-16 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-4">Current issues ({current.length})</Eyebrow>
            <div>
              {current.length === 0 && (
                <p className="py-5 text-sm text-muted-foreground">No open issues.</p>
              )}
              {current.map((a) => (
                <Link
                  key={a.code}
                  to="/raised-activity/$code"
                  params={{ code: a.code }}
                  className="hairline-b flex items-center justify-between gap-6 py-5 transition-opacity duration-500 hover:opacity-60"
                >
                  <span className="text-[15px] text-foreground">
                    {a.code}
                    <span className="ml-3 block text-sm text-muted-foreground">{a.problem}</span>
                  </span>
                  <ActivityStatusPill status={a.status} />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow className="mb-4">Resolved issues ({resolved.length})</Eyebrow>
            <div>
              {resolved.length === 0 && (
                <p className="py-5 text-sm text-muted-foreground">No resolved issues yet.</p>
              )}
              {resolved.map((a) => (
                <Link
                  key={a.code}
                  to="/raised-activity/$code"
                  params={{ code: a.code }}
                  className="hairline-b flex items-center justify-between gap-6 py-5 transition-opacity duration-500 hover:opacity-60"
                >
                  <span className="text-[15px] text-foreground">
                    {a.code}
                    <span className="ml-3 block text-sm text-muted-foreground">{a.problem}</span>
                  </span>
                  <ActivityStatusPill status={a.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>
    </AppShell>
  );
}
