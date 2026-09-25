import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { AppShell } from "./app-shell";
import { Eyebrow, KpiBand, Modal, TextField } from "./primitives";
import { Button } from "@/components/ui/button";
import { initialTasks, quickActions } from "@/lib/echo-data";
import { donationTotals, useDonations } from "@/lib/echo-donations";
import { useGreeting } from "@/lib/echo-session";

const chartData = [
  { m: "Apr", value: 68 },
  { m: "May", value: 75 },
  { m: "Jun", value: 72 },
  { m: "Jul", value: 86 },
  { m: "Aug", value: 91 },
  { m: "Sep", value: 96 },
];

export function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { greeting } = useGreeting();
  const donations = useDonations();

  const add = () => {
    if (!name.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: name.trim(), done: false }]);
    setName("");
    setOpen(false);
  };

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <AppShell>
      {/* Hero — executive operating system, not a SaaS greeting */}
      <header data-reveal className="mb-16 md:mb-24">
        <Eyebrow className="mb-5">Sunday, 20 September — Session 01</Eyebrow>
        <h1 className="glyph-serif max-w-4xl text-5xl leading-[1.02] tracking-tight text-foreground md:text-7xl">
          {greeting}
          <span className="text-muted-foreground"> Here is the state of ECHO.</span>
        </h1>
      </header>

      {/* Full-width KPIs — typography as cards */}
      <section className="hairline-t mb-14">
        <KpiBand
          items={[
            { label: "Open Tasks", value: "37", note: "8 due today" },
            { label: "Active Employees", value: "119", note: "93% of workforce" },
            { label: "Clients", value: "42", note: "+4 this quarter" },
            { label: "Attendance", value: "96.4%", note: "+1.2% vs last month" },
          ]}
        />
      </section>

      {/* Thin monochrome chart */}
      <section data-reveal className="mb-20">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-5">
          <div>
            <Eyebrow className="mb-3">Performance</Eyebrow>
            <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Task completion</h2>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            April — September
          </p>
        </div>
        <div className="h-56 w-full md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
              <defs />
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
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  color: "var(--foreground)",
                  fontSize: 13,
                }}
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
                dataKey="value"
                name="Tasks"
                stroke="var(--accent)"
                strokeWidth={1.25}
                fill="rgba(239,77,35,0.07)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Full-width table — row dividers only */}
      <section data-reveal>
        <div className="mb-8 flex items-end justify-between border-b border-border pb-5">
          <div>
            <Eyebrow className="mb-3">Today’s Agenda</Eyebrow>
            <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Operations queue</h2>
          </div>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            New Task
          </Button>
        </div>

        <div className="hidden grid-cols-[48px_1fr_140px] gap-6 border-b border-border py-3 lg:grid">
          <span className="eyebrow">Index</span>
          <span className="eyebrow">Task</span>
          <span className="eyebrow text-right">Status</span>
        </div>

        <div>
          {tasks.map((task, i) => (
            <div
              key={task.id}
              onClick={() =>
                setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
              }
              className="grid cursor-pointer grid-cols-[auto_1fr] items-center gap-6 border-b border-border py-5 transition-opacity duration-500 hover:opacity-70 lg:grid-cols-[48px_1fr_140px]"
            >
              <span className="hidden text-xs tabular-nums text-muted-foreground lg:block">
                {String(i + 1).padStart(4, "0")}
              </span>
              <span className="flex items-center gap-4">
                <span
                  className={
                    "grid size-5 shrink-0 place-items-center border transition-all duration-500 " +
                    (task.done
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-muted-foreground/40 text-transparent")
                  }
                >
                  <Check
                    className={cn(
                      task.done ? "scale-100" : "scale-0",
                      "size-3 transition-all duration-500",
                    )}
                  />
                </span>
                <span
                  className={
                    task.done ? "text-muted-foreground line-through" : "text-[15px] text-foreground"
                  }
                >
                  {task.title}
                </span>
              </span>
              <span
                className={cn(
                  "justify-self-end text-xs uppercase tracking-[0.16em] lg:text-right",
                  task.done ? "text-muted-foreground/70" : "text-foreground",
                )}
              >
                {task.done ? "Complete" : "Queued"}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nothing here. The queue is clear.
            </p>
          )}
        </div>
      </section>

      {/* Donations */}
      <section data-reveal className="mt-20">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-5">
          <div>
            <Eyebrow className="mb-3">Contributions</Eyebrow>
            <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Donations</h2>
          </div>
          <Link
            to="/donation"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-opacity duration-500 hover:opacity-60"
          >
            Open Donation <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-x-16 gap-y-6 md:grid-cols-2">
          <div className="hairline-b flex items-center justify-between gap-6 py-4">
            <span className="text-sm text-muted-foreground">Approved contributions</span>
            <span className="text-[15px] tabular-nums text-foreground">
              ₹{donationTotals(donations).approvedAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="hairline-b flex items-center justify-between gap-6 py-4">
            <span className="text-sm text-muted-foreground">Awaiting approval</span>
            <span className="text-[15px] tabular-nums text-foreground">
              {donationTotals(donations).pendingCount} donations
            </span>
          </div>
        </div>
      </section>

      {/* Quick actions — full-width hairlined rows */}
      <section data-reveal className="mt-20">
        <div className="mb-8 border-b border-border pb-5">
          <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Move work forward</h2>
        </div>
        <div>
          {quickActions.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between border-b border-border py-6 transition-opacity duration-500 hover:opacity-60"
            >
              <span className="flex items-baseline gap-6">
                <span className="w-8 text-xs tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[15px] text-foreground md:text-base">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground md:text-sm">
                    {item.detail}
                  </span>
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-luxury group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="New Task" eyebrow="Operations" wide>
        <TextField
          label="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
      </Modal>
    </AppShell>
  );
}
