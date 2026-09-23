import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Folder,
  Grid2X2,
  List,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { GenerateDocModal, GeneratedDocRows } from "./bill-generate";
import { AssignedActivities, AssignedActivitiesCount } from "./raised-activity";
import { DataRow, Eyebrow, KpiBand, Modal, PageHeader, SelectField, TextField } from "./primitives";
import { TabBar } from "./employee-detail";
import { Button } from "@/components/ui/button";
import { advances, bills, employees, metrics } from "@/lib/echo-data";
import {
  extendedEmployees,
  finalPayable,
  inr,
  payrollOf,
  submissionReviews,
} from "@/lib/echo-modules-data";
import { cn } from "@/lib/utils";

/* ---------------- Advances ---------------- */
export function AdvancesPage() {
  const [open, setOpen] = useState(false);
  return (
    <AppShell>
      <PageHeader
        title="Employee Advances"
        eyebrow="Finance"
        action={<Button onClick={() => setOpen(true)}>New Advance</Button>}
      />

      <div className="hidden grid-cols-[1fr_120px_140px_140px_120px] gap-8 border-b border-border py-3 md:grid">
        <span className="eyebrow">Employee</span>
        <span className="eyebrow">ID</span>
        <span className="eyebrow">Amount</span>
        <span className="eyebrow">Date</span>
        <span className="eyebrow text-right">Time</span>
      </div>
      <div>
        {advances.map((row) => (
          <div
            key={row.id}
            className="hairline-b grid gap-2 py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[1fr_120px_140px_140px_120px] md:items-center md:gap-8"
          >
            <Link
              to="/employees/$employeeId"
              params={{ employeeId: row.id }}
              className="text-[15px] text-foreground"
            >
              {row.employee}
            </Link>
            <span className="text-sm text-muted-foreground">{row.id}</span>
            <span className="text-[15px] text-foreground">{row.amount}</span>
            <span className="text-sm text-muted-foreground">{row.date}</span>
            <span className="text-sm tabular-nums text-muted-foreground md:text-right">
              {row.time}
            </span>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New advance" eyebrow="Finance">
        <div className="grid gap-9">
          <SelectField label="Employee" required>
            <option value="" disabled>
              Select employee
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </SelectField>
          <TextField label="Amount" type="number" min="1" required />
          <TextField label="Date" type="date" required />
        </div>
      </Modal>
    </AppShell>
  );
}

/* ---------------- Employee Profile ---------------- */
const profileTabs = [
  "Overview",
  "Tasks",
  "Submissions",
  "Attendance",
  "Salary",
  "Advances",
  "Leave",
];

const profileStatusTone: Record<string, string> = {
  "Pending Review": "text-warning",
  Pending: "text-warning",
  "In Progress": "text-warning",
  Approved: "text-success",
  Rejected: "text-destructive",
};

export function EmployeeProfilePage({ employeeId }: { employeeId: string }) {
  const employee = employees.find((e) => e.id === employeeId) ?? employees[0];
  const [tab, setTab] = useState("Overview");
  if (!employee) return null;
  const history = advances.filter((a) => a.id === employee.id);
  const initials = employee.name
    .split(" ")
    .map((x) => x[0])
    .join("");
  const ext = extendedOfEmployee(employeeId);
  const reviews = submissionReviews.find((s) => s.employeeId === employee.id);
  const salary = payrollOf(employee.id);

  return (
    <AppShell>
      <PageHeader
        title={employee.name}
        eyebrow="Employee Profile"
        back={{ to: "/advances", label: "Advances" }}
      />

      <TabBar tabs={profileTabs} active={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div data-reveal className="grid gap-16 pt-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow className="mb-4">Record</Eyebrow>
            <h2 className="glyph-serif text-5xl text-foreground">{initials}</h2>
            <div className="hairline-t mt-6">
              {[
                ["Employee ID", employee.id],
                ["Department", employee.department],
                ["Designation", employee.role],
                ["Years worked", `${employee.years} years`],
                ["Salary", employee.salary],
                ["Rating", `${employee.rating} / 5`],
                ["Leave used", `${employee.leave} days`],
              ].map(([k, v]) => (
                <DataRow key={k}>
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-[15px] text-foreground md:text-right">{v}</span>
                </DataRow>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow className="mb-4">Ledger</Eyebrow>
            <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">
              Advance history
            </h2>
            <div>
              {history.length === 0 && (
                <p className="py-10 text-sm text-muted-foreground">No advances on record.</p>
              )}
              {history.map((a) => (
                <DataRow key={`${a.date}-${a.time}`}>
                  <span>
                    <span className="block text-[15px] text-foreground">{a.amount}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {a.date} · {a.time}
                    </span>
                  </span>
                  <span className="justify-self-end text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
                    Approved
                  </span>
                </DataRow>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Tasks" && (
        <div data-reveal className="pt-10">
          <div className="hidden grid-cols-[64px_1fr_140px] gap-6 border-b border-border py-3 lg:grid">
            <span className="eyebrow">Task</span>
            <span className="eyebrow">Assignment</span>
            <span className="eyebrow text-right">Status</span>
          </div>
          <div>
            {[...ext.assignedTasks]
              .sort((a, b) => b.id - a.id)
              .map((t) => {
                const linked = reviews?.tasks.some((r) => r.id === t.id);
                return (
                  <Link
                    key={t.id}
                    to="/submissions/$employeeId/$taskId"
                    params={{ employeeId: employee.id, taskId: String(t.id) }}
                    className={cn(
                      "grid gap-2 border-b border-border py-5 lg:grid-cols-[64px_1fr_140px] lg:items-center lg:gap-6",
                      linked
                        ? "transition-opacity duration-500 hover:opacity-70"
                        : "pointer-events-none",
                    )}
                  >
                    <span className="text-xs tabular-nums text-muted-foreground">Task #{t.id}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] text-foreground">{t.title}</span>
                      <span className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>{t.client}</span>
                        <span>Due {t.due}</span>
                        <span>In {t.checkIn}</span>
                        <span>Out {t.checkOut}</span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "justify-self-end text-xs uppercase tracking-[0.16em]",
                        profileStatusTone[t.status] ?? "text-muted-foreground",
                      )}
                    >
                      {t.status}
                    </span>
                  </Link>
                );
              })}
          </div>
          <AssignedActivities employeeId={employee.id} />
        </div>
      )}

      {tab === "Submissions" && (
        <div data-reveal className="pt-10">
          <div className="hidden grid-cols-[1fr_140px_160px_160px] gap-6 border-b border-border py-3 md:grid">
            <span className="eyebrow">Task</span>
            <span className="eyebrow">Client</span>
            <span className="eyebrow">Date</span>
            <span className="eyebrow text-right">Review Result</span>
          </div>
          <div>
            {reviews?.tasks.length ? (
              reviews.tasks.map((t) => (
                <Link
                  key={t.id}
                  to="/submissions/$employeeId/$taskId"
                  params={{ employeeId: employee.id, taskId: String(t.id) }}
                  className="grid gap-2 border-b border-border py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[1fr_140px_160px_160px] md:items-center md:gap-6"
                >
                  <span className="text-[15px] text-foreground">
                    Task #{t.id} — {t.title}
                  </span>
                  <span className="text-sm text-muted-foreground">{t.client}</span>
                  <span className="text-sm text-muted-foreground">{t.date}</span>
                  <span
                    className={cn(
                      "justify-self-end text-xs uppercase tracking-[0.16em]",
                      profileStatusTone[t.review],
                    )}
                  >
                    {t.review}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No submissions on record.</p>
            )}
          </div>
          <AssignedActivitiesCount employeeId={employee.id} />
        </div>
      )}

      {tab === "Attendance" && (
        <div data-reveal className="pt-10">
          <div className="hairline-t mt-6">
            {(() => {
              const present = ext.attendance.present.length;
              const absent = ext.attendance.absent.length;
              const late = ext.attendance.late.length;
              return [
                ["Present days", `${present} days`],
                ["Absent days", `${absent} days`],
                ["Late check-ins", `${late} days`],
                ["Working hours", `${ext.attendance.hours} hrs`],
                ["Today's check-in", ext.attendance.checkInToday],
                ["Today's check-out", ext.attendance.checkOutToday],
              ].map(([k, v]) => (
                <DataRow key={k}>
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-[15px] text-foreground md:text-right">{v}</span>
                </DataRow>
              ));
            })()}
            <div className="pt-8">
              <Button asChild variant="secondary">
                <Link to="/monitor/$employeeId" params={{ employeeId: employee.id }}>
                  Open full attendance calendar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "Salary" && (
        <div data-reveal className="pt-10">
          <div className="hairline-t mt-6">
            {[
              ["Monthly Salary", inr(salary.monthly)],
              ["Leave Deductions", `− ${inr(salary.leaveDeduction)}`],
              ["Advance Deductions", `− ${inr(salary.advanceDeduction)}`],
              ["Final Payable Salary", inr(finalPayable(salary))],
            ].map(([k, v]) => (
              <DataRow key={k}>
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="text-[15px] text-foreground md:text-right">{v}</span>
              </DataRow>
            ))}
          </div>
          <div className="pt-10">
            <Eyebrow className="mb-3">Salary history</Eyebrow>
            <div className="hidden grid-cols-[1fr_120px_100px] gap-6 border-b border-border py-3 md:grid">
              <span className="eyebrow">Month</span>
              <span className="eyebrow text-right">Amount</span>
              <span className="eyebrow text-right">Status</span>
            </div>
            <div>
              {salary.history.map((h) => (
                <div
                  key={h.month}
                  className="grid gap-2 border-b border-border py-4 md:grid-cols-[1fr_120px_100px] md:items-center md:gap-6"
                >
                  <span className="text-[15px] text-foreground">{h.month}</span>
                  <span className="text-[15px] text-foreground md:text-right">{inr(h.amount)}</span>
                  <span className="justify-self-end text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-8">
              <Button asChild variant="secondary">
                <Link to="/payroll/$employeeId" params={{ employeeId: employee.id }}>
                  Open Payroll
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "Advances" && (
        <div data-reveal className="pt-10">
          <Eyebrow className="mb-4">Ledger</Eyebrow>
          <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Advance history</h2>
          <div>
            {history.length === 0 && (
              <p className="py-10 text-sm text-muted-foreground">No advances on record.</p>
            )}
            {history.map((a) => (
              <DataRow key={`${a.date}-${a.time}`}>
                <span>
                  <span className="block text-[15px] text-foreground">{a.amount}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {a.date} · {a.time}
                  </span>
                </span>
                <span className="justify-self-end text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
                  Approved
                </span>
              </DataRow>
            ))}
          </div>
        </div>
      )}

      {tab === "Leave" && (
        <div data-reveal className="pt-10">
          <div className="hairline-t mt-6">
            {[
              ["Leave balance", `${ext.leave.balance} days remaining`],
              ["Upcoming approved leave", ext.leave.upcoming],
            ].map(([k, v]) => (
              <DataRow key={k}>
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="text-[15px] text-foreground md:text-right">{v}</span>
              </DataRow>
            ))}
            <div className="pt-8">
              <Eyebrow className="mb-3">Leave history</Eyebrow>
              {ext.leave.history.map((l) => (
                <DataRow key={`${l.date}-${l.reason}`}>
                  <span>
                    <span className="block text-[15px] text-foreground">{l.reason}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{l.date}</span>
                  </span>
                  <span className="justify-self-end text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
                    {l.status}
                  </span>
                </DataRow>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function extendedOfEmployee(employeeId: string) {
  return extendedEmployees.find((e) => e.employee.id === employeeId) ?? extendedEmployees[0]!;
}

/* ---------------- Analytics ---------------- */
const chartData = [
  { m: "Apr", tasks: 68, clients: 22 },
  { m: "May", tasks: 75, clients: 27 },
  { m: "Jun", tasks: 72, clients: 29 },
  { m: "Jul", tasks: 86, clients: 34 },
  { m: "Aug", tasks: 91, clients: 38 },
  { m: "Sep", tasks: 96, clients: 42 },
];

const chartTip = {
  background: "transparent",
  border: "none",
  boxShadow: "none",
  color: "var(--foreground)",
  fontSize: 13,
} as const;

export function AnalyticsPage() {
  return (
    <AppShell>
      <PageHeader title="Company performance" eyebrow="Executive view" />

      <section data-reveal className="hairline-t mb-16">
        <KpiBand
          items={metrics
            .slice(0, 4)
            .map((row) => ({ label: row[0] ?? "", value: row[1] ?? "", note: row[2] ?? "" }))}
        />
      </section>
      <section className="hairline-t mb-16 grid gap-x-20 gap-y-14 lg:grid-cols-2">
        {[
          { eyebrow: "Throughput", title: "Task completion", key: "tasks" },
          { eyebrow: "Reach", title: "Client growth", key: "clients" },
        ].map((chart) => (
          <div key={chart.key} data-reveal>
            <div className="mb-6 border-b border-border pb-5">
              <Eyebrow className="mb-3">{chart.eyebrow}</Eyebrow>
              <h2 className="glyph-serif text-3xl text-foreground">{chart.title}</h2>
            </div>
            <div className="h-48 w-full md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="m"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    width={44}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)" }}
                    contentStyle={chartTip}
                    itemStyle={{ color: "var(--foreground)" }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chart.key}
                    stroke="var(--foreground)"
                    strokeWidth={1.25}
                    fill="rgba(234,230,225,0.04)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </section>

      <section data-reveal className="hairline-t pt-10">
        <Eyebrow className="mb-4">Signal</Eyebrow>
        <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Recent activity</h2>
        <div>
          {[
            "Maya approved invoice INV-2048",
            "Arjun completed Aster Labs inspection",
            "Sara added Nova Retail to client workspace",
            "Dev uploaded before and after evidence",
          ].map((x, i) => (
            <div key={x} className="hairline-b flex gap-6 py-5">
              <span className="w-8 text-xs tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] text-foreground">{x}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

/* ---------------- Vault ---------------- */
export function VaultPage() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [path, setPath] = useState(["Personal Vault"]);
  const items = [
    { name: "FY26 Contracts", meta: "Folder · 12 files", folder: true },
    { name: "Employee Records", meta: "Folder · 8 files", folder: true },
    { name: "Aster Invoice.pdf", meta: "1.4 MB", folder: false },
    { name: "Site Photo.jpg", meta: "3.1 MB", folder: false },
    { name: "Payroll Sep.xlsx", meta: "612 KB", folder: false },
  ];
  return (
    <AppShell>
      <PageHeader
        title="Personal Vault"
        eyebrow="Private storage"
        action={
          <div className="flex gap-2">
            <Button variant="secondary">Upload</Button>
            <Button onClick={() => setPath([...path, "New Folder"])}>New Folder</Button>
          </div>
        }
      />

      <div className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {path.map((p, i) => (
              <button
                key={p}
                onClick={() => setPath(path.slice(0, i + 1))}
                className={cn(
                  "flex items-center gap-2 transition-opacity duration-500 hover:opacity-60",
                  i === path.length - 1 ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {i > 0 && <span className="text-muted-foreground/40">—</span>}
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-2 text-xs uppercase tracking-[0.16em] transition-opacity duration-500 hover:opacity-60",
                view === "list" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <List className="size-3.5" /> List
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-2 text-xs uppercase tracking-[0.16em] transition-opacity duration-500 hover:opacity-60",
                view === "grid" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Grid2X2 className="size-3.5" /> Grid
            </button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-2">
          {items.map((item) => (
            <DataRow key={item.name}>
              <span className="flex items-center gap-4">
                {item.folder ? (
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="text-[15px] text-foreground">{item.name}</span>
              </span>
              <span className="flex items-center justify-end gap-4 text-xs text-muted-foreground md:text-right">
                {item.meta}
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </span>
            </DataRow>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.name}
              className="bg-background p-6 text-left transition-opacity duration-500 hover:opacity-70"
            >
              {item.folder ? (
                <Folder className="size-5 text-muted-foreground" />
              ) : (
                <Paperclip className="size-5 text-muted-foreground" />
              )}
              <span className="mt-6 block text-sm text-foreground">{item.name}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{item.meta}</span>
            </button>
          ))}
        </div>
      )}

      <label className="group mt-10 grid min-h-40 cursor-pointer place-items-center border border-dashed border-border transition-colors duration-500 hover:border-foreground/40">
        <span className="text-center">
          <UploadCloud className="mx-auto mb-3 size-5 text-muted-foreground" />
          <span className="block text-sm text-foreground">Drop a file or browse</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Files stay private to your workspace
          </span>
        </span>
        <input type="file" className="hidden" />
      </label>
    </AppShell>
  );
}

/* ---------------- Bill Book ---------------- */
export function BillBookPage() {
  const [tab, setTab] = useState("All");
  const [generateOpen, setGenerateOpen] = useState(false);
  const kpis = [
    { label: "Paid out", value: "₹8.42L", note: "Across 14 documents" },
    { label: "Awaiting", value: "₹3.18L", note: "6 documents pending" },
    { label: "In draft", value: "₹74K", note: "2 documents in review" },
  ];
  return (
    <AppShell>
      <PageHeader
        title="Bill Book"
        eyebrow="Finance workspace"
        action={<Button onClick={() => setGenerateOpen(true)}>Generate</Button>}
      />

      <section data-reveal className="hairline-t mb-14">
        <KpiBand items={kpis} />
      </section>

      <div className="flex gap-7 border-b border-border pb-3">
        {["All", "Quotations", "Invoices", "Bills"].map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={cn(
              "nav-link pb-2 text-xs uppercase tracking-[0.16em] transition-opacity duration-500 hover:opacity-60",
              tab === x ? "is-active text-foreground" : "text-muted-foreground",
            )}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="hidden grid-cols-[150px_1fr_120px_150px_120px] gap-6 border-b border-border py-3 md:grid">
        <span className="eyebrow">Reference</span>
        <span className="eyebrow">Client</span>
        <span className="eyebrow">Type</span>
        <span className="eyebrow text-right">Amount</span>
        <span className="eyebrow text-right">Status</span>
      </div>
      <div>
        {bills
          .filter((b) => tab === "All" || `${b.type}s` === tab)
          .map((b) => (
            <div
              key={b.id}
              className="hairline-b grid gap-2 py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[150px_1fr_120px_150px_120px] md:items-center md:gap-6"
            >
              <span className="text-[15px] text-foreground">{b.id}</span>
              <span className="text-sm text-muted-foreground">{b.client}</span>
              <span className="text-sm text-muted-foreground">{b.type}</span>
              <span className="text-[15px] text-foreground md:text-right">{b.amount}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
                {b.status}
              </span>
            </div>
          ))}
        {tab === "All" && <GeneratedDocRows />}
      </div>

      <GenerateDocModal open={generateOpen} onClose={() => setGenerateOpen(false)} />
    </AppShell>
  );
}

/* ---------------- Chats ---------------- */
export function ChatsPage() {
  const groups = ["Aster Labs", "Nova Retail", "Meridian House", "Arc Systems"];
  const [active, setActive] = useState(groups[0] ?? "");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  return (
    <AppShell>
      <PageHeader title="Client communication" eyebrow="Group Chats" />

      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="border-b border-border lg:border-b-0 lg:border-r lg:pr-10">
          <div className="relative border-b border-border">
            <Search className="absolute left-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="h-14 w-full bg-transparent pl-8 pr-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div>
            {groups
              .filter((g) => g.toLowerCase().includes(query.toLowerCase()))
              .map((g) => (
                <button
                  key={g}
                  onClick={() => setActive(g)}
                  className={cn(
                    "group flex w-full items-center justify-between border-b border-border py-6 pl-1 text-left transition-opacity duration-500 hover:opacity-70",
                    active === g ? "" : "opacity-50",
                  )}
                >
                  <span className="flex items-center gap-5">
                    <span className="glyph-serif text-xl leading-none text-foreground">
                      {g.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-[15px] text-foreground">{g}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">Active now</span>
                    </span>
                  </span>
                  {active === g && <span className="mr-1 h-1 w-1 rounded-full bg-foreground" />}
                </button>
              ))}
          </div>
        </div>

        <section className="flex min-h-[560px] flex-col lg:pl-12">
          <div className="border-b border-border py-5">
            <h3 className="glyph-serif text-2xl text-foreground">{active}</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              8 members · 3 online
            </p>
          </div>

          <div className="flex-1 space-y-8 py-9">
            <div className="max-w-md">
              <p className="text-[15px] leading-relaxed text-foreground">
                The service team has reached the site. We’ll share photos shortly.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Sara · 4:16 PM</p>
            </div>
            <div className="ml-auto max-w-md text-right">
              <p className="text-[15px] leading-relaxed text-foreground">
                Thank you. Please also attach the signed checklist.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">You · 4:19 PM</p>
            </div>
            {sent.map((m, i) => (
              <div key={i} className="ml-auto max-w-md text-right">
                <p className="text-[15px] leading-relaxed text-foreground">{m}</p>
                <p className="mt-2 text-xs text-muted-foreground">You · just now</p>
              </div>
            ))}
            <div className="flex max-w-md items-start gap-3">
              <MessageCircle className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Awaiting client response on the checklist.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              setSent([...sent, message.trim()]);
              setMessage("");
            }}
            className="hairline-t flex items-center gap-4 pt-4"
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message…"
              className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

/* ---------------- Settings ---------------- */
export function SettingsPage() {
  const navigate = useNavigate();
  const signOut = () => {
    window.sessionStorage.removeItem("echo-session");
    navigate({ to: "/auth" });
  };
  return (
    <AppShell>
      <PageHeader title="Profile Settings" eyebrow="Your account" />

      <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal>
          <Eyebrow className="mb-4">Identity</Eyebrow>
          <h2 className="glyph-serif text-5xl text-foreground">LK</h2>
          <div className="hairline-t mt-6">
            <DataRow>
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-[15px] text-foreground md:text-right">Linkesh Kumar</span>
            </DataRow>
            <DataRow>
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-[15px] text-foreground md:text-right">ECHO Administrator</span>
            </DataRow>
            <DataRow>
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-[15px] text-foreground md:text-right">linkesh@echo.in</span>
            </DataRow>
          </div>
        </div>

        <div>
          <div data-reveal>
            <Eyebrow className="mb-4">01</Eyebrow>
            <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">
              Personal details
            </h2>
          </div>
          <section data-reveal className="hairline-t py-10 first:border-t-0">
            <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
              <TextField label="Name" defaultValue="Linkesh Kumar" />
              <TextField label="Email" type="email" defaultValue="linkesh@echo.in" />
              <TextField label="Phone" defaultValue="+91 98765 43210" />
              <TextField label="New password" type="password" />
            </div>
          </section>

          <div data-reveal>
            <Eyebrow className="mb-4">02</Eyebrow>
            <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Appearance</h2>
          </div>
          <section data-reveal className="hairline-t py-10">
            <button
              type="button"
              onClick={() => {
                const dark = document.documentElement.classList.toggle("dark", true);
                window.localStorage.setItem("echo-theme", "dark");
              }}
              className="group flex w-full items-center justify-between border-b border-border py-5 text-left transition-opacity duration-500 hover:opacity-70"
            >
              <span className="text-sm text-foreground">Theme</span>
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Obsidian
              </span>
            </button>
          </section>

          <Button className="mt-8">Save changes</Button>

          <div data-reveal className="mt-8">
            <Eyebrow className="mb-4">03</Eyebrow>
            <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Session</h2>
          </div>
          <section data-reveal className="hairline-t py-10">
            <button
              type="button"
              onClick={signOut}
              className="group flex w-full items-center justify-between border-b border-border py-5 text-left transition-opacity duration-500 hover:opacity-70"
            >
              <span className="text-sm text-foreground">Sign out</span>
              <LogOut className="size-4 text-muted-foreground" />
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------------- Help ---------------- */
export function HelpPage() {
  const [copied, setCopied] = useState("");
  const contacts: Array<[string, string, string]> = [
    ["Website", "xelevate.in", "https://xelevate.in"],
    ["Email", "linkesh@xelevate.in", "mailto:linkesh@xelevate.in"],
    ["Phone", "+91 9791062642", "tel:+919791062642"],
  ];
  return (
    <AppShell>
      <PageHeader title="How can we help?" eyebrow="Support" />

      <section data-reveal>
        <Eyebrow className="mb-4">Direct</Eyebrow>
        <h2 className="glyph-serif mb-8 max-w-xl text-3xl leading-tight text-foreground md:text-4xl">
          Reach the ECHO team for product guidance, technical support, or account assistance.
        </h2>
        <div>
          {contacts.map(([label, value, href]) => (
            <div key={label} className="hairline-b flex items-center justify-between gap-6 py-6">
              <span className="w-24 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </span>
              <a
                href={href}
                className="text-[15px] text-foreground transition-opacity duration-500 hover:opacity-60"
              >
                {value}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(value);
                  setCopied(label);
                }}
              >
                {copied === label ? "Copied" : <MoreHorizontal className="size-4" />}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <footer className="hairline-t mt-16 pt-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/60">
          Powered by Xelevate
        </p>
      </footer>
    </AppShell>
  );
}
