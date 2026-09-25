import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Image as ImageIcon, Trash2, X } from "lucide-react";
import { AppShell } from "./app-shell";
import {
  AreaField,
  Eyebrow,
  PageHeader,
  SaveBar,
  SelectField,
  TextField,
  ToggleRow,
} from "./primitives";
import { SectionBlock, StatusPill } from "./employee-detail";
import { CallButton } from "./call-button";
import {
  newTaskSchedule,
  ScheduleFields,
  taskScheduleSummary,
  type TaskSchedule,
} from "./schedule-fields";
import { Button } from "@/components/ui/button";
import { clients, employees } from "@/lib/echo-data";
import {
  addMaintenanceRecord,
  clientProfile,
  maintenanceRecords,
  type MaintenanceRecord,
} from "@/lib/echo-ops-data";
import { employeeByName, employeePhoneOf } from "@/lib/echo-modules-data";
import { cn } from "@/lib/utils";

const phoneForName = (name: string) => {
  const id = employeeByName(name)?.id;
  return id ? employeePhoneOf(id) : undefined;
};

const maintenanceTone: Record<string, string> = {
  Pending: "text-warning",
  "In Progress": "text-warning",
  Completed: "text-success",
};

function MaintenanceRow({ m }: { m: MaintenanceRecord }) {
  return (
    <div className="grid gap-2 border-b border-border py-5 md:grid-cols-[56px_1.2fr_1fr_200px] lg:grid-cols-[56px_1.2fr_1fr_140px_130px_110px_120px_110px] md:items-center md:gap-6">
      <span className="hidden text-xs tabular-nums text-muted-foreground md:block">{m.code}</span>
      <Link
        to="/clients/$clientName"
        params={{ clientName: m.client }}
        className={cn(
          "w-max text-[15px] text-foreground",
          clientProfile(m.client).code !== "CL-NEW" &&
            "transition-opacity duration-500 hover:opacity-60",
        )}
      >
        {m.client}
      </Link>
      <span className="hidden lg:block">
        <CallButton phone={clientProfile(m.client).phone} name={m.client} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] text-foreground">{m.what}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {m.site}
          {m.schedule ? ` · ${m.schedule}` : ""}
        </span>
      </span>
      <span className="hidden items-center gap-3 text-sm text-muted-foreground lg:flex">
        {m.employee}
        <CallButton phone={phoneForName(m.employee)} name={m.employee} />
      </span>
      <span className="hidden text-sm text-muted-foreground md:block">{m.date}</span>
      <span className="hidden text-sm text-muted-foreground md:block">{m.time}</span>
      <span className="hidden text-sm text-foreground lg:block md:text-right">
        ₹{m.cost.toLocaleString("en-IN")}
      </span>
      <span
        className={cn(
          "hidden text-xs uppercase tracking-[0.16em] lg:block",
          maintenanceTone[m.status] ?? "text-muted-foreground",
        )}
      >
        {m.status}
      </span>
      <span className="flex justify-end lg:hidden">
        <Button asChild size="sm" variant="secondary">
          <Link to="/clients/$clientName" params={{ clientName: m.client }}>
            View <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </span>
    </div>
  );
}

/* ---------------- Maintenance Chart ---------------- */

export function MaintenanceChartPage() {
  return (
    <AppShell>
      <PageHeader
        title="Maintenance Chart"
        eyebrow="Maintenance"
        action={
          <Button asChild>
            <Link to="/maintenance/new">+ Create Maintenance</Link>
          </Button>
        }
      />

      <div className="hidden grid-cols-[56px_1.2fr_1fr_140px_130px_110px_120px_110px] gap-6 border-b border-border py-3 lg:grid">
        <span className="eyebrow">Code</span>
        <span className="eyebrow">Client</span>
        <span className="eyebrow">Maintenance</span>
        <span className="eyebrow">Employee</span>
        <span className="eyebrow">Date</span>
        <span className="eyebrow">Time</span>
        <span className="eyebrow text-right">Cost</span>
        <span className="eyebrow text-right">Status</span>
      </div>
      <div>
        {maintenanceRecords.map((m) => (
          <MaintenanceRow key={m.code} m={m} />
        ))}
      </div>
    </AppShell>
  );
}

/* ---------------- Photo upload with preview ---------------- */

function PhotoUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
}) {
  if (value) {
    return (
      <div className="relative grid min-h-40 place-items-center border border-border bg-surface">
        <ImageIcon className="size-6 text-muted-foreground/70" />
        <span className="mt-3 block text-sm text-foreground">{value}</span>
        <span className="mt-1 block text-xs text-muted-foreground">preview ready</span>
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={() => onChange("")}
          className="absolute right-3 top-3 grid size-8 place-items-center text-muted-foreground transition-opacity duration-500 hover:opacity-60"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  return (
    <label className="group grid min-h-40 cursor-pointer place-items-center border border-dashed border-border text-center transition-colors duration-500 hover:border-foreground/40">
      <span>
        <ImageIcon className="mx-auto mb-3 size-5 text-muted-foreground" />
        <strong className="block text-sm font-medium text-foreground">{label}</strong>
        <small className="mt-1 block text-xs text-muted-foreground">Drop a photo or browse</small>
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f.name);
        }}
      />
    </label>
  );
}

/* ---------------- Create Maintenance ---------------- */

const maintenanceTypes = [
  "Daily Sweeping Inside Garden",
  "Watering the Garden",
  "Bio Fertiliser",
  "Trimming",
  "Other (manual)",
];

/* One repeatable line of the chart: what, how it repeats, when, and whether it is compulsory. */
interface MaintenanceBlock {
  key: number;
  what: string;
  manualWhat: string;
  schedule: TaskSchedule;
  time: string;
  mandatory: boolean;
}

let blockKey = 0;
const newBlock = (): MaintenanceBlock => ({
  key: (blockKey += 1),
  what: maintenanceTypes[0]!,
  manualWhat: "",
  schedule: newTaskSchedule(),
  time: "",
  mandatory: true,
});

const today = () => {
  const now = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

const todayIso = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export function CreateMaintenancePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState("");
  const [manualClient, setManualClient] = useState("");
  const [employee, setEmployee] = useState("");
  const [manualEmployee, setManualEmployee] = useState("");
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>([newBlock()]);
  const [description, setDescription] = useState("");
  const [site, setSite] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");

  const patchBlock = (key: number, patch: Partial<MaintenanceBlock>) =>
    setBlocks((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const resolvedWhat = (block: MaintenanceBlock) =>
    block.what === "Other (manual)" ? block.manualWhat.trim() || block.what : block.what;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const stamp = today();
    for (const block of blocks) {
      const label = taskScheduleSummary({ ...block.schedule, title: "maintenance" });
      const scheduleNote = label
        ? `${label}${block.mandatory ? " · Mandatory" : " · Optional"}`
        : "";
      addMaintenanceRecord({
        client: manualClient.trim() || client,
        what: resolvedWhat(block),
        description: description.trim(),
        site: site.trim(),
        employee: manualEmployee.trim() || employee,
        date: stamp,
        time: block.time || "—",
        cost: Number(cost) || 0,
        currency: "INR",
        notes: notes.trim(),
        ...(before.trim() ? { before: before.trim() } : {}),
        ...(after.trim() ? { after: after.trim() } : {}),
        ...(scheduleNote ? { schedule: scheduleNote } : {}),
      });
    }
    setSaved(true);
    window.setTimeout(() => navigate({ to: "/maintenance" }), 700);
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Maintenance"
        eyebrow="Maintenance"
        back={{ to: "/maintenance", label: "Maintenance Chart" }}
      />

      <form onSubmit={submit} className="pb-8">
        <SectionBlock eyebrow="01" title="Client">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <SelectField
              label="Select existing client"
              value={manualClient ? "" : client}
              onChange={(e) => setClient(e.target.value)}
            >
              <option value="">Choose a client</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Or enter client name"
              value={manualClient}
              onChange={(e) => setManualClient(e.target.value)}
              maxLength={120}
            />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="02" title="Employee">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <SelectField
              label="Assign employee"
              value={manualEmployee ? "" : employee}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="">Choose an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} · {emp.role}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Or enter employee manually"
              value={manualEmployee}
              onChange={(e) => setManualEmployee(e.target.value)}
              maxLength={100}
            />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="03" title="What Maintenance?">
          {blocks.map((block, i) => (
            <div
              key={block.key}
              className={cn(i > 0 && "mt-9 border-t border-border pt-9")}
              data-block={i + 1}
            >
              <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
                <SelectField
                  label="What Maintenance?"
                  value={block.what}
                  onChange={(e) => patchBlock(block.key, { what: e.target.value })}
                >
                  {maintenanceTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectField>
                {block.what === "Other (manual)" && (
                  <TextField
                    label="Describe the maintenance"
                    value={block.manualWhat}
                    onChange={(e) => patchBlock(block.key, { manualWhat: e.target.value })}
                    required
                    maxLength={140}
                  />
                )}
              </div>

              <div className="mt-9">
                <ScheduleFields
                  row={block.schedule}
                  onChange={(next) => patchBlock(block.key, { schedule: next })}
                  maxDaysPerMonth={31}
                  weekdayContext={todayIso()}
                  dailyHint="This maintenance repeats every day."
                  syncDaysToDates
                />
              </div>

              <div className="mt-6 grid items-end gap-x-16 gap-y-9 md:grid-cols-2">
                <TextField
                  label="Maintenance time"
                  type="time"
                  value={block.time}
                  onChange={(e) => patchBlock(block.key, { time: e.target.value })}
                  required
                />
                <div className={cn(block.what === "Other (manual)" && "md:col-start-2")}>
                  <ToggleRow
                    label="Mandatory"
                    detail="Missed visits are flagged in the maintenance chart."
                    checked={block.mandatory}
                    onChange={() => patchBlock(block.key, { mandatory: !block.mandatory })}
                  />
                </div>
              </div>

              {i > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBlocks((rows) => rows.filter((r) => r.key !== block.key))}
                  >
                    <Trash2 className="size-4" />
                    Remove maintenance {i + 1}
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="mt-9 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBlocks((rows) => [...rows, newBlock()])}
            >
              Add Another Maintenance
            </Button>
          </div>

          <div className="mt-9 grid gap-x-16 gap-y-9 md:grid-cols-2">
            <TextField
              label="Site / location name"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              required
              maxLength={140}
            />
            <AreaField
              label="Maintenance description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="md:col-span-2"
              required
              maxLength={1200}
            />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="04" title="Photos">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <PhotoUpload label="Before Photo" value={before} onChange={setBefore} />
            <PhotoUpload label="After Photo" value={after} onChange={setAfter} />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="05" title="Cost">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <div className="relative">
              <TextField
                label="Maintenance cost"
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
              <span className="absolute right-0 top-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Currency — INR
              </span>
            </div>
            {cost && (
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  Amount —{" "}
                  <span className="text-[15px] text-foreground">
                    ₹{Number(cost).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="06" title="Additional notes">
          <AreaField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
          />
        </SectionBlock>

        <SaveBar label="Create Maintenance Record" />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          The record is added to the Maintenance Chart and linked to the client & employee. It
          becomes available in the Client Portal.
        </p>
      </form>

      {saved && (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-enter bg-foreground px-6 py-3 text-sm text-background">
          Maintenance record saved
        </div>
      )}
    </AppShell>
  );
}
