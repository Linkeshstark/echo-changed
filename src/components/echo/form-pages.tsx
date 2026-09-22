import { useState } from "react";
import { Check, Eye, EyeOff, Mic, Plus, Trash2, UploadCloud } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { clients, employees } from "@/lib/echo-data";
import { cn } from "@/lib/utils";

function Success({ title }: { title: string }) {
  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-enter bg-foreground px-6 py-3 text-sm text-background">
      {title} saved
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
  onSubmit,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  saved: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AppShell>
      <PageHeader title={title} eyebrow={eyebrow} />
      <form onSubmit={onSubmit} className="pb-8">
        {children}
        <SaveBar />
      </form>
      {saved && <Success title={title} />}
    </AppShell>
  );
}

export function NewTaskPage() {
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [reqs, setReqs] = useState<string[]>([]);
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
        <SelectField label="Assign to" name="assignee" required>
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

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type TaskFrequency = "Daily" | "Weekly" | "Monthly";

interface TaskSchedule {
  title: string;
  frequency: TaskFrequency;
  daysPerWeek: number;
  weekdays: string[];
  daysPerMonth: number;
  monthDates: number[];
  pattern: string;
}

const newTaskSchedule = (): TaskSchedule => ({
  title: "",
  frequency: "Daily",
  daysPerWeek: 1,
  weekdays: [],
  daysPerMonth: 2,
  monthDates: [],
  pattern: "",
});

function ordinal(n: number) {
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
}

function taskScheduleSummary(row: TaskSchedule) {
  if (row.frequency === "Daily") return "Daily";
  if (row.frequency === "Weekly" && row.weekdays.length)
    return `Weekly · ${row.daysPerWeek} day${row.daysPerWeek > 1 ? "s" : ""}/week · ${row.weekdays.join(", ")}`;
  if (row.frequency === "Monthly" && row.pattern)
    return `Monthly · ${row.daysPerMonth} day${row.daysPerMonth > 1 ? "s" : ""}/month · ${row.pattern}`;
  if (row.frequency === "Monthly" && row.monthDates.length)
    return `Monthly · ${row.daysPerMonth} day${row.daysPerMonth > 1 ? "s" : ""}/month · ${row.monthDates
      .slice()
      .sort((a, b) => a - b)
      .map(ordinal)
      .join(", ")}`;
  return "";
}

function RegularTaskRow({
  index,
  row,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  row: TaskSchedule;
  canRemove: boolean;
  onChange: (next: TaskSchedule) => void;
  onRemove: () => void;
}) {
  const patch = (p: Partial<TaskSchedule>) => onChange({ ...row, ...p });
  const incomplete =
    !!row.title.trim() &&
    ((row.frequency === "Weekly" && row.weekdays.length !== row.daysPerWeek) ||
      (row.frequency === "Monthly" && !row.pattern && row.monthDates.length !== row.daysPerMonth));
  const summary = row.title.trim() ? taskScheduleSummary(row) : "";

  return (
    <div className="mt-6 first:mt-0">
      <div className="grid items-end gap-6 border-b border-border pb-6 md:grid-cols-[1fr_220px_44px]">
        <TextField
          label={`Task ${index + 1}`}
          value={row.title}
          onChange={(e) => patch({ title: e.target.value })}
          maxLength={140}
          data-save
        />
        <SelectField
          label="Frequency"
          value={row.frequency}
          onChange={(e) => patch({ frequency: e.target.value as TaskFrequency })}
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </SelectField>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={!canRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      {row.frequency === "Weekly" && (
        <div className="mt-6 space-y-6 border-b border-border pb-6">
          <SelectField
            label="How many days per week?"
            value={String(row.daysPerWeek)}
            onChange={(e) => patch({ daysPerWeek: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} day{n > 1 ? "s" : ""}
              </option>
            ))}
          </SelectField>
          <div>
            <span className="eyebrow">Days of the week</span>
            <div className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4 md:grid-cols-7">
              {WEEKDAYS.map((d) => {
                const on = row.weekdays.includes(d);
                return (
                  <label
                    key={d}
                    className={cn(
                      "transition-colors duration-500",
                      on ? "bg-foreground text-background" : "bg-background",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() =>
                        patch({
                          weekdays: on ? row.weekdays.filter((x) => x !== d) : [...row.weekdays, d],
                        })
                      }
                    />
                    <span className="grid h-12 cursor-pointer place-items-center text-xs uppercase tracking-[0.12em] text-current">
                      {d.slice(0, 3)}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs tabular-nums text-muted-foreground">
              {row.weekdays.length} of {row.daysPerWeek} selected
            </p>
          </div>
        </div>
      )}

      {row.frequency === "Monthly" && (
        <div className="mt-6 space-y-6 border-b border-border pb-6">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <SelectField
              label="How many days per month?"
              value={String(row.daysPerMonth)}
              onChange={(e) => patch({ daysPerMonth: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} day{n > 1 ? "s" : ""}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Or a recurring pattern (optional)"
              value={row.pattern}
              onChange={(e) => patch({ pattern: e.target.value })}
            >
              <option value="">None</option>
              <option value="1st Monday of every month">1st Monday of every month</option>
              <option value="2nd Tuesday of every month">2nd Tuesday of every month</option>
              <option value="Last Friday of every month">Last Friday of every month</option>
              <option value="1st of every month">1st of every month</option>
              <option value="15th of every month">15th of every month</option>
            </SelectField>
          </div>
          <div>
            <span className="eyebrow">Dates of the month</span>
            <div className="mt-3 grid grid-cols-7 gap-px border border-border bg-border">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const on = row.monthDates.includes(d);
                return (
                  <label
                    key={d}
                    className={cn(
                      "transition-colors duration-500",
                      on ? "bg-foreground text-background" : "bg-background",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() =>
                        patch({
                          monthDates: on
                            ? row.monthDates.filter((x) => x !== d)
                            : [...row.monthDates, d],
                        })
                      }
                    />
                    <span className="grid h-12 cursor-pointer place-items-center text-xs tabular-nums text-current">
                      {d}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs tabular-nums text-muted-foreground">
              {row.monthDates.length} of {row.daysPerMonth} selected
            </p>
          </div>
        </div>
      )}

      {incomplete ? (
        <p className="mt-5 text-xs uppercase tracking-[0.14em] text-destructive">
          {row.frequency === "Weekly"
            ? `Select exactly ${row.daysPerWeek} day${row.daysPerWeek > 1 ? "s" : ""} per week to continue.`
            : `Select exactly ${row.daysPerMonth} date${row.daysPerMonth > 1 ? "s" : ""} or choose a recurring pattern.`}
        </p>
      ) : (
        summary && (
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {summary}
          </p>
        )
      )}
      <input type="hidden" name={`task-${index}-schedule`} value={summary} data-save />
    </div>
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

  const scheduleComplete = tasks.every(
    (t) =>
      !t.title.trim() ||
      t.frequency === "Daily" ||
      (t.frequency === "Weekly" && t.weekdays.length === t.daysPerWeek) ||
      (t.frequency === "Monthly" && (!!t.pattern || t.monthDates.length === t.daysPerMonth)),
  );

  return (
    <FormLayout
      title="Create New Employee"
      eyebrow="People"
      saved={saved}
      onSubmit={(e) => {
        e.preventDefault();
        if (passwordsMatch && scheduleComplete) {
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
  return (
    <FormLayout
      title="Create New Activity"
      eyebrow="Service desk"
      saved={saved}
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Section index={1} title="Complaint details">
        <AreaField
          label="Complaint"
          className="md:col-span-2"
          required
          maxLength={1000}
          data-save
        />
        <SelectField label="Client name" required>
          <option value="" disabled>
            Select client
          </option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField label="Assigned employee" required>
          <option value="" disabled>
            Select employee
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </SelectField>
        <AreaField label="Work required" className="md:col-span-2" required data-save />
      </Section>

      <Section index={2} title="Visual evidence">
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
