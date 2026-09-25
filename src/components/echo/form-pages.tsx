import { useState } from "react";
import { Check, Eye, EyeOff, Mic, Plus, UploadCloud } from "lucide-react";
import { AppShell } from "./app-shell";
import {
  AreaField,
  PageHeader,
  SaveBar,
  Section,
  SelectField,
  TextField,
  ToggleRow,
} from "./primitives";
import { CallablePhone } from "./call-button";
import { Button } from "@/components/ui/button";
import { clients, employees } from "@/lib/echo-data";
import { employeePhoneOf } from "@/lib/echo-modules-data";
import {
  activityPriorities,
  addRaisedActivity,
  nextActivityTicket,
  type ActivityPriority,
} from "@/lib/echo-ops-data";
import { ActivityPriorityPill } from "./raised-activity";
import {
  newTaskSchedule,
  scheduleComplete,
  RegularTaskRow,
  type TaskSchedule,
} from "./schedule-fields";
import { cn } from "@/lib/utils";

function Success({ title, note }: { title: string; note?: string }) {
  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-enter bg-foreground px-6 py-3 text-sm text-background">
      {title} saved
      {note ? <span className="ml-2 opacity-70">{note}</span> : null}
    </div>
  );
}

function savePayload(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof document === "undefined") return out;
  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-save]")
    .forEach((el) => {
      out[el.name || el.id || "field"] = el.value;
    });
  return out;
}

function FormLayout({
  title,
  eyebrow,
  children,
  saved,
  savedNote,
  onSubmit,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  saved: boolean;
  savedNote?: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AppShell>
      <PageHeader title={title} eyebrow={eyebrow} />
      <form onSubmit={onSubmit} className="pb-8">
        {children}
        <SaveBar />
      </form>
      {saved && <Success title={title} {...(savedNote ? { note: savedNote } : {})} />}
    </AppShell>
  );
}

export function NewTaskPage() {
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [reqs, setReqs] = useState<string[]>([]);
  const assigneeId = employees.find((e) => e.name === assignee)?.id;
  const toggle = (x: string) =>
    setReqs(reqs.includes(x) ? reqs.filter((r) => r !== x) : [...reqs, x]);
  return (
    <FormLayout
      title="Create New Task"
      eyebrow="Operations"
      saved={saved}
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        console.log("task", savePayload());
      }}
    >
      <Section
        index={1}
        title="Assignment"
        description="Choose an employee or enter a team member manually."
      >
        <SelectField
          label="Assign to"
          name="assignee"
          required
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="" disabled>
            Select employee
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </SelectField>
        <TextField label="Manual assignee" name="manual" maxLength={100} data-save />
        {assigneeId && (
          <div className="flex items-center gap-4 md:col-span-2">
            <span className="text-sm text-muted-foreground">Contact</span>
            <CallablePhone phone={employeePhoneOf(assigneeId)} name={assignee} />
          </div>
        )}
        <AreaField
          label="Task description"
          name="description"
          className="md:col-span-2"
          required
          maxLength={1200}
          data-save
        />
        <div className="md:col-span-2 flex items-center gap-4">
          <Button
            type="button"
            variant={recording ? "destructive" : "secondary"}
            onClick={() => setRecording(!recording)}
          >
            <Mic className="size-4" />
            {recording ? "Stop recording · 00:08" : "Record voice note"}
          </Button>
        </div>
      </Section>

      <Section index={2} title="Schedule">
        <TextField label="Date" name="date" type="date" required data-save />
        <TextField label="Check in" name="checkin" type="time" required data-save />
        <TextField label="Check out" name="checkout" type="time" required data-save />
      </Section>

      <Section
        index={3}
        title="Employee requirements"
        description="Selected evidence will appear in the Worker Portal."
      >
        <div className="md:col-span-2">
          {[
            "Upload Before & After",
            "Upload Voice Reply",
            "Upload 4 Photos & 1 Video",
            "Upload Signature",
            "Upload Mark",
          ].map((x) => (
            <ToggleRow key={x} label={x} checked={reqs.includes(x)} onChange={() => toggle(x)} />
          ))}
        </div>
      </Section>

      <Section index={4} title="Narrative">
        <AreaField
          label="Additional notes"
          name="notes"
          className="md:col-span-2"
          maxLength={2000}
          data-save
        />
      </Section>
    </FormLayout>
  );
}

export function NewEmployeePage() {
  const [saved, setSaved] = useState(false);
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tasks, setTasks] = useState<TaskSchedule[]>([newTaskSchedule()]);
  const [permissions, setPermissions] = useState(["Personal Vault"]);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const passwordsMatch =
    passwordConfirm.length > 0 &&
    password.length > 0 &&
    password === passwordConfirm &&
    password.length >= 6;

  const scheduleDone = tasks.every(scheduleComplete);

  return (
    <FormLayout
      title="Create New Employee"
      eyebrow="People"
      saved={saved}
      onSubmit={(e) => {
        e.preventDefault();
        if (passwordsMatch && scheduleDone) {
          setSaved(true);
          console.log("employee", savePayload());
        }
      }}
    >
      <Section index={1} title="Personal">
        <TextField label="Full name" name="name" required maxLength={100} data-save />
        <TextField
          label="Aadhaar number"
          name="aadhaar"
          inputMode="numeric"
          maxLength={12}
          required
          data-save
        />
        <TextField label="PAN" name="pan" maxLength={10} required data-save />
        <TextField
          label="Phone number"
          name="phone"
          inputMode="tel"
          maxLength={15}
          required
          data-save
        />
      </Section>

      <Section index={2} title="Bank details">
        <TextField
          label="Account number"
          name="account"
          value={account}
          onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 18))}
          required
        />
        <div className="relative">
          <TextField
            label="Confirm account number"
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 18))}
            required
          />
          <span className="absolute right-0 top-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {confirm ? (confirm === account ? "Match" : "Mismatch") : ""}
          </span>
        </div>
        <TextField label="IFSC" name="ifsc" maxLength={11} required data-save />
        <TextField label="Account name" name="acctname" maxLength={100} required data-save />
      </Section>

      <Section
        index={3}
        title="Account security"
        description="Set a sign-in password for this employee's portal account."
      >
        <div className="relative">
          <TextField
            label="New Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            maxLength={100}
            required
            data-save
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-opacity duration-500 hover:opacity-60"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="relative">
          <TextField
            label="Confirm Password"
            name="confirm-password"
            type={showPasswordConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            minLength={6}
            maxLength={100}
            required
            data-save
          />
          <button
            type="button"
            aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-opacity duration-500 hover:opacity-60"
          >
            {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="md:col-span-2">
          {passwordConfirm && password === passwordConfirm && password.length >= 6 ? (
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-success">
              <Check className="size-3.5" /> Passwords match
            </p>
          ) : passwordConfirm && password !== passwordConfirm ? (
            <p className="text-xs uppercase tracking-[0.14em] text-destructive">
              Passwords do not match.
            </p>
          ) : password && password.length < 6 ? (
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Minimum 6 characters.
            </p>
          ) : (
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Both fields must match to create the employee.
            </p>
          )}
        </div>
      </Section>

      <Section index={4} title="Employment">
        <TextField label="Employee code" name="code" required data-save />
        <TextField label="Designation" name="designation" required data-save />
        <TextField label="Monthly salary" name="salary" type="number" min="0" required data-save />
        <TextField label="Agreement start" name="start" type="date" required data-save />
        <TextField label="Agreement end" name="end" type="date" required data-save />
      </Section>

      <Section
        index={5}
        title="Regular daily tasks"
        description="Add up to 10 recurring responsibilities."
      >
        <div className="md:col-span-2">
          {tasks.map((task, i) => (
            <RegularTaskRow
              key={i}
              index={i}
              row={task}
              canRemove={tasks.length > 1}
              onChange={(next) => setTasks(tasks.map((t, n) => (n === i ? next : t)))}
              onRemove={() => setTasks(tasks.filter((_, n) => n !== i))}
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            disabled={tasks.length >= 10}
            onClick={() => setTasks([...tasks, newTaskSchedule()])}
            className="mt-6"
          >
            <Plus className="size-4" /> Add recurring task
          </Button>
        </div>
      </Section>

      <Section index={6} title="Worker Portal permissions">
        <div className="md:col-span-2">
          {["Personal Vault", "Photo Gallery", "Company Official Group", "Voucher Creation"].map(
            (x) => (
              <ToggleRow
                key={x}
                label={x}
                checked={permissions.includes(x)}
                onChange={() =>
                  setPermissions(
                    permissions.includes(x)
                      ? permissions.filter((p) => p !== x)
                      : [...permissions, x],
                  )
                }
              />
            ),
          )}
        </div>
      </Section>
    </FormLayout>
  );
}

export function NewClientPage() {
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<string[]>([
    employees[0]?.id ?? "",
    employees[1]?.id ?? "",
  ]);
  return (
    <FormLayout
      title="Create New Client"
      eyebrow="Clients"
      saved={saved}
      onSubmit={(e) => {
        e.preventDefault();
        if (selected.length >= 2) setSaved(true);
      }}
    >
      <Section index={1} title="Client details">
        <TextField label="Name" name="name" required data-save />
        <TextField label="Company" name="company" required data-save />
        <TextField label="Phone" name="phone" inputMode="tel" required data-save />
        <TextField label="Email" name="email" type="email" required data-save />
        <TextField label="GSTIN" name="gstin" maxLength={15} data-save />
        <AreaField label="GST address" name="gstaddr" data-save />
      </Section>

      <Section
        index={2}
        title="Client group chat"
        description="Admin and client are added automatically. Choose 2–20 employees."
      >
        <div className="md:col-span-2">
          {employees.map((e) => (
            <ToggleRow
              key={e.id}
              label={`${e.name} · ${e.role}`}
              checked={selected.includes(e.id)}
              onChange={() =>
                setSelected(
                  selected.includes(e.id)
                    ? selected.filter((x) => x !== e.id)
                    : [...selected, e.id],
                )
              }
            />
          ))}
          <p className="mt-4 text-xs text-muted-foreground">
            {selected.length} employees selected · minimum 2, maximum 20
          </p>
        </div>
      </Section>
    </FormLayout>
  );
}

export function NewActivityPage() {
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState("");
  const [assignee, setAssignee] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ActivityPriority>("High Priority");
  const [ticket, setTicket] = useState(nextActivityTicket);

  const create = () => {
    const created = addRaisedActivity({
      client: client || clients[0]!,
      site: "Main site",
      siteAddress: "—",
      problem: problem.trim() || "New activity",
      description: description.trim(),
      notes: "",
      priority,
      status: "Raised",
      ...(assignee ? { assignee } : {}),
      attachments: [],
    });
    setTicket(created.ticket);
    setSaved(true);
  };

  return (
    <FormLayout
      title="Create New Activity"
      eyebrow="Service desk"
      saved={saved}
      {...(saved ? { savedNote: `Ticket ${ticket}` } : {})}
      onSubmit={(e) => {
        e.preventDefault();
        create();
      }}
    >
      <Section index={1} title="Ticket">
        <div className="md:col-span-2">
          <span className="eyebrow">Ticket ID — generated automatically</span>
          <p className="mt-3 flex items-center gap-3 text-[15px] text-foreground">
            <span className="size-1.5 rounded-full bg-foreground" />
            {ticket}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Every new activity is issued the next unique ticket in the series.
          </p>
        </div>
      </Section>

      <Section index={2} title="Complaint details">
        <AreaField
          label="Complaint"
          className="md:col-span-2"
          required
          maxLength={1000}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          data-save
        />
        <SelectField
          label="Client name"
          required
          value={client}
          onChange={(e) => setClient(e.target.value)}
        >
          <option value="" disabled>
            Select client
          </option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Assigned employee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">Unassigned</option>
          {employees.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </SelectField>
        <AreaField
          label="Work required"
          className="md:col-span-2"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-save
        />
        <SelectField
          label="Priority"
          required
          value={priority}
          onChange={(e) => setPriority(e.target.value as ActivityPriority)}
        >
          {activityPriorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
        <div className="flex items-end pb-2">
          <ActivityPriorityPill priority={priority} />
        </div>
      </Section>

      <Section index={3} title="Visual evidence">
        <UploadBox label="Before photo" />
        <UploadBox label="After photo" />
      </Section>
    </FormLayout>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <label className="group grid min-h-36 cursor-pointer place-items-center border border-dashed border-border text-center transition-colors duration-500 hover:border-foreground/40">
      <span>
        <UploadCloud className="mx-auto mb-3 size-5 text-muted-foreground" />
        <strong className="block text-sm font-medium text-foreground">{label}</strong>
        <small className="mt-1 block text-xs text-muted-foreground">Drop a file or browse</small>
      </span>
      <input type="file" accept="image/*" className="hidden" />
    </label>
  );
}
