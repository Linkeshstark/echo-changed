/*
 * Recurring scheduling — the model the employee regular-task form was built on.
 * Maintenance orders reuse it verbatim so both read the same way.
 */

import { SelectField, TextField } from "./primitives";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type TaskFrequency = "Daily" | "Weekly" | "Monthly";

export interface TaskSchedule {
  title: string;
  frequency: TaskFrequency;
  daysPerWeek: number;
  weekdays: string[];
  daysPerMonth: number;
  monthDates: number[];
  pattern: string;
}

export const newTaskSchedule = (): TaskSchedule => ({
  title: "",
  frequency: "Daily",
  daysPerWeek: 1,
  weekdays: [],
  daysPerMonth: 2,
  monthDates: [],
  pattern: "",
});

export function ordinal(n: number) {
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

export function taskScheduleSummary(row: TaskSchedule) {
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

export function scheduleComplete(row: TaskSchedule) {
  return (
    !row.title.trim() ||
    row.frequency === "Daily" ||
    (row.frequency === "Weekly" && row.weekdays.length === row.daysPerWeek) ||
    (row.frequency === "Monthly" && (!!row.pattern || row.monthDates.length === row.daysPerMonth))
  );
}

/* Frequency + its dependent fields. Shared by employee regular tasks and maintenance. */
export function ScheduleFields({
  row,
  onChange,
  withTitle = false,
  titleLabel = "Task",
}: {
  row: TaskSchedule;
  onChange: (next: TaskSchedule) => void;
  withTitle?: boolean;
  titleLabel?: string;
}) {
  const patch = (p: Partial<TaskSchedule>) => onChange({ ...row, ...p });
  const incomplete =
    !!row.title.trim() &&
    ((row.frequency === "Weekly" && row.weekdays.length !== row.daysPerWeek) ||
      (row.frequency === "Monthly" && !row.pattern && row.monthDates.length !== row.daysPerMonth));

  return (
    <div>
      <div className="grid items-end gap-6 border-b border-border pb-6 md:grid-cols-[1fr_220px]">
        {withTitle ? (
          <TextField
            label={titleLabel}
            value={row.title}
            onChange={(e) => patch({ title: e.target.value })}
            maxLength={140}
            data-save
          />
        ) : (
          <div />
        )}
        <SelectField
          label="Frequency"
          value={row.frequency}
          onChange={(e) => patch({ frequency: e.target.value as TaskFrequency })}
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </SelectField>
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
        taskScheduleSummary(row) && (
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {taskScheduleSummary(row)}
          </p>
        )
      )}
    </div>
  );
}

/* A full row: title, frequency block, remove. Used by the employee task list. */
export function RegularTaskRow({
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
  const summary = row.title.trim() ? taskScheduleSummary(row) : "";
  return (
    <div className="mt-6 first:mt-0">
      <ScheduleFields row={row} onChange={onChange} withTitle titleLabel={`Task ${index + 1}`} />
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={!canRemove}>
          <Trash2 className="size-4" />
          Remove task {index + 1}
        </Button>
      </div>
      <input type="hidden" name={`task-${index}-schedule`} value={summary} data-save />
    </div>
  );
}
