import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Image as ImageIcon, X } from "lucide-react";
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
import { newTaskSchedule, ScheduleFields, taskScheduleSummary } from "./schedule-fields";
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

export function CreateMaintenancePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState("");
  const [manualClient, setManualClient] = useState("");
  const [employee, setEmployee] = useState("");
  const [manualEmployee, setManualEmployee] = useState("");
  const [what, setWhat] = useState(maintenanceTypes[0]!);
  const [manualWhat, setManualWhat] = useState("");
  const [description, setDescription] = useState("");
  const [site, setSite] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [schedule, setSchedule] = useState(newTaskSchedule());
  const [mandatory, setMandatory] = useState(true);

  const resolvedWhat = what === "Other (manual)" ? manualWhat.trim() || what : what;
  const scheduleLabel = taskScheduleSummary({ ...schedule, title: "maintenance" });
  const scheduleNote = scheduleLabel
    ? `${scheduleLabel}${mandatory ? " · Mandatory" : " · Optional"}`
    : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const record = addMaintenanceRecord({
      client: manualClient.trim() || client,
      what: resolvedWhat,
      description: description.trim(),
      site: site.trim(),
      employee: manualEmployee.trim() || employee,
      date: date || "—",
      time: time || "—",
      cost: Number(cost) || 0,
      currency: "INR",
      notes: notes.trim(),
      ...(before.trim() ? { before: before.trim() } : {}),
      ...(after.trim() ? { after: after.trim() } : {}),
      ...(scheduleNote ? { schedule: scheduleNote } : {}),
    });
    void record;
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
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <SelectField
              label="What Maintenance?"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
            >
              {maintenanceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectField>
            {what === "Other (manual)" && (
              <TextField
                label="Describe the maintenance"
                value={manualWhat}
                onChange={(e) => setManualWhat(e.target.value)}
                required
                maxLength={140}
              />
            )}
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
            <TextField
              label="Maintenance date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextField
              label="Maintenance time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="04" title="Photos">
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <PhotoUpload label="Before Photo" value={before} onChange={setBefore} />
            <PhotoUpload label="After Photo" value={after} onChange={setAfter} />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="05" title="Scheduling">
          <p className="mb-8 text-sm text-muted-foreground">
            Repeats follow the same rules as employee regular tasks — daily, weekly or monthly.
          </p>
          <ScheduleFields row={schedule} onChange={setSchedule} />
          <div className="mt-6">
            <ToggleRow
              label="Mandatory"
              detail="Missed visits are flagged in the maintenance chart."
              checked={mandatory}
              onChange={() => setMandatory(!mandatory)}
            />
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="06" title="Cost">
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

        <SectionBlock eyebrow="07" title="Additional notes">
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
