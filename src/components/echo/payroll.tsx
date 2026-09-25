import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  BadgeCheck,
  Building2,
  Download,
  IndianRupee,
  Landmark,
  Banknote,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { DataRow, Eyebrow, KpiBand, Modal, PageHeader } from "./primitives";
import { DetailRows, downloadTextFile, StatusPill } from "./employee-detail";
import { CallButton, CallablePhone } from "./call-button";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/echo-data";
import {
  employeePhoneOf,
  finalPayable,
  inr,
  payroll,
  payrollOf,
  type PayrollRecord,
} from "@/lib/echo-modules-data";
import { cn } from "@/lib/utils";

/* ---------------- Payroll dashboard ---------------- */

export function PayrollPage() {
  const monthly = payroll.reduce((sum, p) => sum + p.monthly, 0);
  const paid = payroll.filter((p) => p.status === "Paid");
  const pending = payroll.filter((p) => p.status === "Pending");
  const paidLifetime = paid.reduce((sum, p) => sum + finalPayable(p), 0);

  return (
    <AppShell>
      <PageHeader title="Payroll" eyebrow="Finance" />

      <section data-reveal className="hairline-t mb-14">
        <KpiBand
          items={[
            { label: "Monthly Payroll", value: inr(monthly), note: "Eligible this cycle" },
            { label: "Paid Employees", value: String(paid.length), note: "Settled" },
            { label: "Pending Payments", value: String(pending.length), note: "Awaiting payout" },
            { label: "Total Salary", value: inr(paidLifetime), note: "Paid to date" },
          ]}
        />
      </section>

      <section data-reveal>
        <div className="mb-8 border-b border-border pb-5">
          <Eyebrow className="mb-3">Salary register</Eyebrow>
          <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Employees</h2>
        </div>
        <div className="hidden grid-cols-[1fr_120px_140px_120px] gap-8 border-b border-border py-3 md:grid">
          <span className="eyebrow">Employee</span>
          <span className="eyebrow">ID</span>
          <span className="eyebrow">Salary</span>
          <span className="eyebrow text-right">Status</span>
        </div>
        <div>
          {payroll.map((row) => {
            const employee = employees.find((e) => e.id === row.employeeId);
            return (
              <Link
                key={row.employeeId}
                to="/payroll/$employeeId"
                params={{ employeeId: row.employeeId }}
                search={{ month: undefined }}
                className="group grid gap-2 border-b border-border py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[1fr_120px_140px_120px] md:items-center md:gap-8"
              >
                <span className="flex items-center gap-4">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-[15px] text-foreground">
                    {employee?.name ?? row.employeeId}
                  </span>
                  <CallButton phone={employeePhoneOf(row.employeeId)} name={employee?.name} />
                </span>
                <span className="text-sm text-muted-foreground">{row.employeeId}</span>
                <span className="text-[15px] text-foreground">{inr(row.monthly)}</span>
                <span className="justify-self-end">
                  <StatusPill status={row.status} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

/* ---------------- Salary details ---------------- */

const providers = [
  { name: "Razorpay Payouts", note: "Instant UPI + bank routes", icon: Landmark },
  { name: "Cashfree Payouts", note: "Bulk transfer engine", icon: Banknote },
  { name: "Bank Transfer API", note: "Direct corporate mandate", icon: Building2 },
  { name: "UPI", note: "VPA collection supported", icon: IndianRupee },
  { name: "NEFT / IMPS", note: "Scheduled settlement", icon: ArrowDownToLine },
];

function PayFlow({ record }: { record: PayrollRecord }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(providers[0]!.name);
  const [step, setStep] = useState<"choose" | "done">("choose");
  const paid = record.status === "Paid" ? record.payment : undefined;

  const slip = () => {
    const employee = employees.find((e) => e.id === record.employeeId);
    downloadTextFile(
      `salary-slip-${record.employeeId}-sep.txt`,
      [
        "ECHO — SALARY SLIP",
        "==================",
        "",
        `Employee  : ${employee?.name ?? record.employeeId} (${record.employeeId})`,
        `Department: ${record.department}`,
        `Month     : September 2026`,
        "",
        `Monthly Salary        : ${inr(record.monthly)}`,
        `Bonus                 : ${inr(record.bonus)}`,
        `Leave Deductions      : -${inr(record.leaveDeduction)}`,
        `Advance Deductions    : -${inr(record.advanceDeduction)}`,
        `Final Payable Salary  : ${inr(finalPayable(record))}`,
        "",
        paid ?? { txId: "PAY-837241", date: "22 Sep 2026", time: "11:42 AM", method },
        `Transaction ID : ${(paid ?? { txId: "PAY-837241" }).txId}`,
        `Payment Method : ${paid?.method ?? method}`,
        "",
        "This is a computer generated payslip.",
      ].join("\n"),
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <Eyebrow className="mb-3">Payment gateway</Eyebrow>
        <h3 className="glyph-serif mb-6 text-2xl text-foreground">Future ready integrations</h3>
        <div className="border border-border">
          {providers.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setMethod(p.name);
                setStep("choose");
                setOpen(true);
              }}
              disabled={record.status === "Paid"}
              className="group flex w-full items-center justify-between gap-6 border-b border-border px-5 py-4 text-left transition-opacity duration-500 last:border-b-0 hover:opacity-70 disabled:opacity-40"
            >
              <span className="flex items-center gap-4">
                <p.icon className="size-4 shrink-0 text-muted-foreground" />
                <span>
                  <span className="block text-sm text-foreground">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{p.note}</span>
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                Mock
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Placeholder integrations. Live payout keys will be wired here in the next release.
        </p>
      </div>

      <div>
        {record.status === "Paid" && paid ? (
          <div className="border border-border bg-surface px-6 py-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="size-5 text-success" />
              <Eyebrow className="!text-success">Payment confirmed</Eyebrow>
            </div>
            <p className="glyph-serif mt-4 text-4xl text-foreground">{inr(finalPayable(record))}</p>
            <div className="mt-6">
              <DataRow>
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-[15px] text-foreground md:text-right">{paid.txId}</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <span className="text-[15px] text-foreground md:text-right">{paid.date}</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Time</span>
                <span className="text-[15px] text-foreground md:text-right">{paid.time}</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="text-[15px] text-foreground md:text-right">{paid.method}</span>
              </DataRow>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border px-6 py-10 text-center">
            <IndianRupee className="mx-auto mb-4 size-6 text-muted-foreground" />
            <p className="text-[15px] text-foreground">Payment not yet processed</p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Use one of the mock gateways to run this month&apos;s payout for{" "}
              {inr(finalPayable(record))}.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => {
                  setStep("choose");
                  setOpen(true);
                }}
              >
                Pay Salary
              </Button>
            </div>
          </div>
        )}
        {record.status === "Paid" && (
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={slip}>
              <Download className="size-4" /> Download Salary Slip
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={step === "done" ? "Payment confirmed" : "Confirm payout"}
        eyebrow={step === "done" ? "Razorpay — mock" : "Mock payment"}
      >
        {step === "choose" ? (
          <div className="grid gap-9">
            <div>
              <Eyebrow className="mb-3">Gateway</Eyebrow>
              <p className="text-[15px] text-foreground">{method}</p>
            </div>
            <div>
              <Eyebrow className="mb-3">Amount</Eyebrow>
              <p className="glyph-serif text-4xl text-foreground">{inr(finalPayable(record))}</p>
            </div>
            <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              This is a mock payout. No money is moved. Confirming simulates the gateway response so
              the employee&apos;s salary record can update.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("done")}>Simulate Payout</Button>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <DataRow>
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-[15px] text-foreground md:text-right">PAY-837241</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <span className="text-[15px] text-foreground md:text-right">22 Sep 2026</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Time</span>
                <span className="text-[15px] text-foreground md:text-right">11:42 AM</span>
              </DataRow>
              <DataRow>
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="text-[15px] text-foreground md:text-right">{method}</span>
              </DataRow>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <StatusPill status="Paid" />
              <Button variant="secondary" onClick={slip}>
                <Download className="size-4" /> Download Salary Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------------- Salary details page ---------------- */

export function SalaryDetailsPage({
  employeeId,
  month,
}: {
  employeeId: string;
  month?: string | undefined;
}) {
  const employee = employees.find((e) => e.id === employeeId) ?? employees[0]!;
  const record = payrollOf(employee.id);

  /* A notification can point at one month of the salary record. */
  const monthRow = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (month) monthRow.current?.scrollIntoView({ block: "center" });
  }, [month]);

  return (
    <AppShell>
      <PageHeader
        title={employee.name}
        eyebrow="Salary details"
        back={{ to: "/payroll", label: "Payroll" }}
      />

      <div data-reveal className="mb-14">
        <DetailRows
          rows={[
            ["Employee Name", employee.name],
            ["Employee ID", employee.id],
            [
              "Phone Number",
              <CallablePhone
                key="phone"
                phone={employeePhoneOf(employee.id)}
                name={employee.name}
              />,
            ],
            ["Department", record.department],
            ["Monthly Salary", inr(record.monthly)],
            ["Attendance", record.attendance],
            ["Leave Deductions", `− ${inr(record.leaveDeduction)}`],
            ["Advance Deductions", `− ${inr(record.advanceDeduction)}`],
            ["Final Payable Salary", inr(finalPayable(record))],
          ]}
        />
      </div>

      <section data-reveal>
        <div className="mb-8 border-b border-border pb-5">
          <Eyebrow className="mb-3">Settlement</Eyebrow>
          <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Run payout</h2>
        </div>
        <PayFlow record={record} />
      </section>

      <section data-reveal className="hairline-t pt-14">
        <div className="mb-8 border-b border-border pb-5">
          <Eyebrow className="mb-3">History</Eyebrow>
          <h2 className="glyph-serif text-3xl text-foreground md:text-4xl">Salary record</h2>
        </div>
        <div className="hidden grid-cols-[1fr_140px_120px] gap-6 border-b border-border py-3 md:grid">
          <span className="eyebrow">Month</span>
          <span className="eyebrow text-right">Amount</span>
          <span className="eyebrow text-right">Status</span>
        </div>
        <div>
          {record.history.map((h) => (
            <div
              key={h.month}
              ref={month === h.month ? monthRow : undefined}
              className={cn(
                "grid gap-2 border-b border-border py-5 md:grid-cols-[1fr_140px_120px] md:items-center md:gap-6",
                month === h.month && "bg-accent/10",
              )}
            >
              <span className="text-[15px] text-foreground">{h.month}</span>
              <span className="text-[15px] text-foreground md:text-right">{inr(h.amount)}</span>
              <span className="flex justify-end">
                <StatusPill status={h.status} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
