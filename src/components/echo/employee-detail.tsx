import { type ReactNode } from "react";
import { CheckCircle2, FileText, Mic, PenLine, Play, Target, XCircle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { DataRow, Eyebrow } from "./primitives";
import type { TaskSubmission, UploadedFile } from "@/lib/echo-modules-data";

/* ---------------- Browser-style tabs (nav-link underline) ---------------- */

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "nav-link pb-2 text-xs uppercase tracking-[0.16em] transition-opacity duration-500 hover:opacity-60",
            tab === active ? "is-active text-foreground" : "text-muted-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Section block (eyebrow + serif title + hairline) ---------------- */

export function SectionBlock({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section data-reveal className={cn("hairline-t py-12 md:py-14", className)}>
      <div className="mb-8 border-b border-border pb-5 md:mb-10">
        <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
        <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ---------------- Status dot ---------------- */

const statusStyle: Record<string, string> = {
  "Pending Review": "bg-warning",
  Pending: "bg-warning",
  Productive: "bg-success",
  Working: "bg-success",
  Active: "bg-success",
  Approved: "bg-success",
  Paid: "bg-success",
  "On Leave": "bg-muted-foreground",
  InProgress: "bg-warning",
  "In Progress": "bg-warning",
  "Waiting Review": "bg-warning",
  Rejected: "bg-destructive",
  Disapproved: "bg-destructive",
};

export function StatusPill({ status }: { status: string }) {
  const dot = statusStyle[status] ?? "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}

/* ---------------- Uploaded file tiles ---------------- */

const kindIcon = (kind: UploadedFile["kind"]) => {
  switch (kind) {
    case "Voice":
      return { icon: Mic, note: "Play" };
    case "Video":
      return { icon: Play, note: "Play" };
    case "Signature":
      return { icon: PenLine, note: "Preview" };
    case "Mark":
      return { icon: Target, note: "Preview" };
    default:
      return { icon: FileText, note: "View" };
  }
};

export function FileTile({ file, index }: { file: UploadedFile; index: number }) {
  if (file.kind === "Photo") {
    return (
      <div className="group grid aspect-[4/3] cursor-pointer place-items-center border border-border bg-surface transition-opacity duration-500 hover:opacity-60">
        <span className="px-4 text-center">
          <span className="glyph-serif block text-2xl text-foreground/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-[13px] text-foreground">{file.label}</span>
          <span className="mt-1 block text-[11px] text-muted-foreground">{file.meta}</span>
        </span>
      </div>
    );
  }
  const { icon: Icon, note } = kindIcon(file.kind);
  return (
    <div className="group flex cursor-pointer items-center gap-5 border border-border bg-surface px-5 py-4 transition-opacity duration-500 hover:opacity-60">
      <span className="grid size-11 shrink-0 place-items-center border border-border text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[15px] text-foreground">
          {file.label}
          <Play className="size-3 text-muted-foreground" />
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {file.meta} · {note}
        </span>
      </span>
    </div>
  );
}

export function ChecklistGrid({ checklist }: { checklist: TaskSubmission["checklist"] }) {
  return (
    <div>
      <div className="hidden grid-cols-[1fr_120px] gap-6 border-b border-border py-3 md:grid">
        <span className="eyebrow">Requirement</span>
        <span className="eyebrow text-right">Status</span>
      </div>
      {checklist.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border py-4 md:grid-cols-[1fr_120px]"
        >
          <span className="text-[15px] text-foreground">{item.label}</span>
          <span className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.16em]">
            {item.completed ? (
              <>
                <CheckCircle2 className="size-3.5 text-success" />
                <span className="text-success">Completed</span>
              </>
            ) : (
              <>
                <XCircle className="size-3.5 text-destructive" />
                <span className="text-destructive">Pending</span>
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Detail rows ---------------- */

export function DetailRows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div>
      {rows.map(([k, v]) => (
        <DataRow key={k}>
          <span className="text-sm text-muted-foreground">{k}</span>
          <span className="text-[15px] text-foreground md:text-right">{v}</span>
        </DataRow>
      ))}
    </div>
  );
}

/* ---------------- Entry rows (a small one-line primitive) ---------------- */

export function EntryRow({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="hairline-b flex items-center justify-between gap-6 py-4 transition-opacity duration-500 last:border-b-0">
      <span className="text-[15px] text-foreground">{children}</span>
      {right}
    </div>
  );
}

/* ---------------- Small recharts line ---------------- */

const chartTipStyle = {
  background: "transparent",
  border: "none",
  boxShadow: "none",
  color: "var(--foreground)",
  fontSize: 12,
} as const;

export function MiniTrend({
  data,
  dataKey,
  height = 44,
}: {
  data: number[];
  dataKey: string;
  height?: number;
}) {
  const chart = data.map((value, i) => ({
    m: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i] ?? `${i}`,
    [dataKey]: value,
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chart} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="m"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            dy={8}
          />
          <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={chartTipStyle}
            itemStyle={{ color: "var(--foreground)" }}
            labelStyle={{
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              fontSize: 10,
              letterSpacing: "0.14em",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="var(--accent)"
            strokeWidth={1.25}
            fill="rgba(239,77,35,0.07)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------------- Sticky quick actions ---------------- */

export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="echo-glass sticky bottom-0 z-30 -mx-5 mt-16 border-t border-border px-5 py-4 md:-mx-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">{children}</div>
    </div>
  );
}

/* ---------------- Download helper ---------------- */

export function downloadTextFile(name: string, content: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
