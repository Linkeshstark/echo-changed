import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "./app-shell";
import { Eyebrow, PageHeader, SelectField } from "./primitives";
import { PassportCropper } from "./photo-crop";
import { SectionBlock, StatusPill } from "./employee-detail";
import { Button } from "@/components/ui/button";
import {
  employeeOfVoucher,
  getVoucher,
  getVouchersOf,
  removePhoto,
  reviewVoucher,
  setPhoto,
  usePhotos,
  useVouchers,
  voucherReasons,
  type VoucherRecord,
} from "@/lib/echo-vouchers";

/* ---------------- Shared bits ---------------- */

function reasonText(v: VoucherRecord) {
  if (v.reason !== "Other") return v.reason;
  return v.customReason ? `Other / ${v.customReason}` : "Other";
}

function VoucherTimeline({ events }: { events: VoucherRecord["timeline"] }) {
  return (
    <div>
      {events.map((ev, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 border-b border-border py-5 md:flex-row md:items-baseline md:gap-6"
        >
          <span className="w-40 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {ev.at}
          </span>
          <span className="text-[15px] text-foreground">{ev.text}</span>
        </div>
      ))}
    </div>
  );
}

function voucherInfoRows(v: VoucherRecord): Array<{ label: string; value: ReactNode }> {
  const rows: Array<{ label: string; value: ReactNode }> = [
    { label: "Voucher Code", value: v.code },
    { label: "Reason", value: reasonText(v) },
    { label: "Date", value: v.date },
    { label: "Time", value: v.time },
  ];
  if (v.amount) rows.push({ label: "Amount", value: v.amount });
  rows.push({ label: "Submitted at", value: v.submittedAt });
  rows.push({
    label: "Status",
    value: (
      <span key="status">
        <StatusPill status={v.status} />
      </span>
    ),
  });
  return rows;
}

function VoucherModal({
  open,
  eyebrow,
  title,
  onClose,
  footer,
  children,
}: {
  open: boolean;
  eyebrow?: string;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-5 backdrop-blur-md animate-fade"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-enter w-full max-w-[520px] bg-background"
      >
        <div className="border-b border-border pb-5">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h2 className="glyph-serif text-3xl text-foreground">{title}</h2>
        </div>
        <div className="py-8">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border pt-6">{footer}</div>
        )}
      </div>
    </div>
  );
}

const thead = "eyebrow";

/* ---------------- Profile photo (add / edit / replace / remove / preview) ---------------- */

export function ProfilePhotoBox({
  employeeId,
  initials,
}: {
  employeeId: string;
  initials: string;
}) {
  const photos = usePhotos();
  const photo = photos[employeeId];
  const [open, setOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = () => fileRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <div className="relative grid h-44 place-items-center overflow-hidden border border-border bg-surface">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="glyph-serif text-6xl text-foreground/70">{initials}</span>
        )}
        <button
          onClick={() => setOpen(true)}
          className="absolute inset-x-0 bottom-0 bg-background/80 py-2 text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          {photo ? "Edit Photo" : "Add Photo"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <VoucherModal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Profile photo"
        title={photo ? "Edit photo" : "Add photo"}
        footer={
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <Eyebrow className="mb-3">Preview</Eyebrow>
        <div className="grid h-56 place-items-center overflow-hidden border border-border bg-surface">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="glyph-serif text-5xl text-foreground/70">{initials}</span>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Upload a photo from your device. A 4:5 crop window opens next, where the image can be
          dragged, zoomed and rotated before it replaces the initials placeholder.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={pickFile}>
            {photo ? "Replace photo" : "Upload from device"}
          </Button>
          {photo && (
            <>
              <Button type="button" variant="secondary" onClick={() => setCropSrc(photo)}>
                Adjust crop
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  removePhoto(employeeId);
                }}
              >
                Remove photo
              </Button>
            </>
          )}
        </div>
      </VoucherModal>

      {cropSrc && (
        <PassportCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onSave={(dataUrl) => {
            setPhoto(employeeId, dataUrl);
            setOpen(false);
            setCropSrc(null);
          }}
        />
      )}
    </>
  );
}

/* ---------------- Employee profile: Vouchers tab ---------------- */

export function VouchersTab({ employeeId }: { employeeId: string }) {
  useVouchers();
  const rows = getVouchersOf(employeeId);
  const [target, setTarget] = useState<null | {
    code: string;
    status: "Approved" | "Disapproved";
  }>(null);
  const [note, setNote] = useState("");

  const confirm = () => {
    if (!target) return;
    reviewVoucher(target.code, target.status, note.trim() || undefined);
    setNote("");
    setTarget(null);
  };

  return (
    <div data-reveal>
      <div className="hidden grid-cols-[64px_170px_1fr_130px_100px_130px_140px_230px] gap-6 border-b border-border py-3 lg:grid">
        <span className={thead}>No.</span>
        <span className={thead}>Voucher Code</span>
        <span className={thead}>Reason</span>
        <span className={thead}>Date</span>
        <span className={thead}>Time</span>
        <span className={thead}>Amount</span>
        <span className={thead}>Status</span>
        <span className={thead} />
      </div>
      {rows.length === 0 && (
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          No vouchers raised by this employee yet.
        </p>
      )}
      {rows.map((v, i) => (
        <div
          key={v.code}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 lg:grid lg:grid-cols-[64px_170px_1fr_130px_100px_130px_140px_230px] lg:gap-6"
        >
          <span className="hidden text-xs tabular-nums text-muted-foreground lg:block">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <span className="block text-[15px] text-foreground">{v.code}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground lg:hidden">
              {reasonText(v)} · {v.date} · {v.time} · {v.amount ?? "—"}
            </span>
          </div>
          <span className="hidden text-sm text-muted-foreground lg:block">{reasonText(v)}</span>
          <span className="hidden text-sm text-muted-foreground lg:block">{v.date}</span>
          <span className="hidden text-sm text-muted-foreground lg:block">{v.time}</span>
          <span className="hidden text-sm text-foreground lg:block">{v.amount ?? "—"}</span>
          <span>
            <StatusPill status={v.status} />
          </span>
          <span className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link
                to="/monitor/$employeeId/vouchers/$voucherCode"
                params={{ employeeId, voucherCode: v.code }}
                search={{ tab: undefined, task: undefined }}
              >
                View
              </Link>
            </Button>
            {v.status === "Pending" && (
              <>
                <Button size="sm" onClick={() => setTarget({ code: v.code, status: "Approved" })}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setTarget({ code: v.code, status: "Disapproved" })}
                >
                  Reject
                </Button>
              </>
            )}
          </span>
        </div>
      ))}

      <VoucherModal
        open={target !== null}
        onClose={() => setTarget(null)}
        eyebrow="Review voucher"
        title={target?.status === "Approved" ? "Approve this voucher?" : "Reject this voucher?"}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={target?.status === "Disapproved" ? "destructive" : "default"}
              onClick={confirm}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {target?.code} · {employeeId}
        </p>
        <label className="mt-6 block">
          <span className="eyebrow">Admin note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add a note for the employee…"
            className="mt-2 w-full resize-none border-b border-border bg-transparent py-3 text-[15px] text-foreground outline-none transition-colors duration-500 placeholder:text-muted-foreground/60 focus:border-foreground/40"
          />
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          {target?.status === "Approved"
            ? "The status changes to Approved immediately and the employee portal shows the updated status."
            : "The status changes to Rejected immediately and the employee portal shows the updated status."}
        </p>
      </VoucherModal>
    </div>
  );
}

/* ---------------- Employee profile: read-only voucher details ---------------- */

export function EmployeeVoucherDetailPage({
  employeeId,
  voucherCode,
}: {
  employeeId: string;
  voucherCode: string;
}) {
  const v = getVoucher(voucherCode);
  const x = v ? employeeOfVoucher(v.employeeId) : employeeOfVoucher(employeeId);

  return (
    <AppShell>
      <PageHeader
        title={v?.code ?? "Voucher"}
        eyebrow="Employee voucher"
        back={{ to: "/monitor/$employeeId", label: "Employee Monitor", params: { employeeId } }}
      />

      {!v ? (
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          Voucher not found.
        </p>
      ) : (
        <>
          <SectionBlock eyebrow="Employee" title="Employee Information">
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              {[
                ["Name", x.name],
                ["Employee Code", x.id],
                ["Department", x.department],
                ["Designation", x.role],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="eyebrow">{label}</span>
                  <p className="mt-2 text-[15px] text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock eyebrow="Voucher" title="Voucher Information">
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              {voucherInfoRows(v).map((r) => (
                <div key={r.label}>
                  <span className="eyebrow">{r.label}</span>
                  <div className="mt-2 text-[15px] text-foreground">{r.value}</div>
                </div>
              ))}
              {v.adminNote && (
                <div className="md:col-span-2">
                  <span className="eyebrow">Admin Response</span>
                  <p className="mt-2 text-[15px] text-foreground">{v.adminNote}</p>
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <span className="eyebrow">Explanation</span>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground">
                {v.description}
              </p>
            </div>
          </SectionBlock>

          <SectionBlock eyebrow="History" title="Voucher timeline">
            <VoucherTimeline events={v.timeline} />
          </SectionBlock>
        </>
      )}
    </AppShell>
  );
}

/* ---------------- Admin: Raised Voucher list ---------------- */

export function RaisedVoucherPage() {
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("All");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("All");

  const all = useVouchers();

  const dates = useMemo(
    () => Array.from(new Set(all.map((v) => v.date))).sort((a, b) => (a < b ? 1 : -1)),
    [all],
  );

  const visible = all.filter((v) => {
    const text = `${v.code} ${reasonText(v)} ${v.description}`.toLowerCase();
    return (
      (text.includes(query.toLowerCase()) ||
        `${employeeOfVoucher(v.employeeId).name} ${v.employeeId}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (reason === "All" || v.reason === reason) &&
      (status === "All" || v.status === status) &&
      (date === "All" || v.date === date)
    );
  });

  return (
    <AppShell>
      <PageHeader title="Raised Voucher" eyebrow="Vouchers" />

      <div className="grid gap-x-12 gap-y-8 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee, ID, voucher code…"
            className="h-12 w-full border-b border-border bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <SelectField
          label="Voucher type"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option>All</option>
          {voucherReasons.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </SelectField>
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {["Pending", "Approved", "Disapproved"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <SelectField label="Date" value={date} onChange={(e) => setDate(e.target.value)}>
          <option>All</option>
          {dates.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </SelectField>
      </div>

      <div data-reveal>
        <div className="hidden grid-cols-[56px_1fr_120px_150px_110px_90px_130px_110px] gap-6 border-b border-border py-3 lg:grid">
          <span className={thead}>No.</span>
          <span className={thead}>Employee</span>
          <span className={thead}>Employee ID</span>
          <span className={thead}>Reason</span>
          <span className={thead}>Date</span>
          <span className={thead}>Time</span>
          <span className={thead}>Status</span>
          <span className={thead} />
        </div>

        {visible.length === 0 && (
          <p className="border-b border-border py-8 text-sm text-muted-foreground">
            No raised vouchers match these filters.
          </p>
        )}

        {visible.map((v, i) => {
          const x = employeeOfVoucher(v.employeeId);
          return (
            <div
              key={v.code}
              className="flex items-center justify-between gap-4 border-b border-border py-5 lg:grid lg:grid-cols-[56px_1fr_120px_150px_110px_90px_130px_110px] lg:gap-6"
            >
              <span className="hidden text-xs tabular-nums text-muted-foreground lg:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="block text-[15px] text-foreground">{x.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground lg:hidden">
                  {x.id} · {reasonText(v)} · {v.date}
                </span>
              </div>
              <span className="hidden text-sm text-muted-foreground lg:block">{x.id}</span>
              <span className="hidden text-sm text-muted-foreground lg:block">{reasonText(v)}</span>
              <span className="hidden text-sm text-muted-foreground lg:block">{v.date}</span>
              <span className="hidden text-sm text-muted-foreground lg:block">{v.time}</span>
              <span>
                <StatusPill status={v.status} />
              </span>
              <span className="justify-self-end">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/raised-voucher/$voucherCode" params={{ voucherCode: v.code }}>
                    View Details
                  </Link>
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

/* ---------------- Admin: Raised Voucher details + review ---------------- */

export function RaisedVoucherDetailPage({ voucherCode }: { voucherCode: string }) {
  useVouchers();
  const v = getVoucher(voucherCode);

  return (
    <AppShell>
      <PageHeader
        title="Raised Voucher Details"
        eyebrow={v ? `${v.code} · ${v.employeeId}` : "Raised Voucher"}
        back={{ to: "/raised-voucher", label: "Raised Voucher" }}
      />

      {!v ? (
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          Voucher not found.
        </p>
      ) : (
        <RaisedVoucherReview v={v} />
      )}
    </AppShell>
  );
}

function RaisedVoucherReview({ v }: { v: VoucherRecord }) {
  const x = employeeOfVoucher(v.employeeId);
  const photos = usePhotos();
  const photo = photos[v.employeeId];
  const reviewed = v.status !== "Pending";
  const [pending, setPending] = useState<null | "Approved" | "Disapproved">(null);
  const [note, setNote] = useState("");

  const confirmReview = () => {
    if (!pending) return;
    reviewVoucher(v.code, pending, note.trim() || undefined);
    setNote("");
    setPending(null);
  };

  return (
    <>
      <SectionBlock eyebrow="Employee" title="Employee">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="grid h-44 place-items-center overflow-hidden border border-border bg-surface">
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="glyph-serif text-6xl text-foreground/70">
                {x.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
            {[
              ["Name", x.name],
              ["Employee Code", x.id],
              ["Designation", x.role],
              ["Department", x.department],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="eyebrow">{label}</span>
                <p className="mt-2 text-[15px] text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="Voucher" title="Voucher Information">
        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          {voucherInfoRows(v).map((r) => (
            <div key={r.label}>
              <span className="eyebrow">{r.label}</span>
              <div className="mt-2 text-[15px] text-foreground">{r.value}</div>
            </div>
          ))}
          {v.adminNote && (
            <div className="md:col-span-2">
              <span className="eyebrow">Admin Response</span>
              <p className="mt-2 text-[15px] text-foreground">{v.adminNote}</p>
            </div>
          )}
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <span className="eyebrow">Explanation</span>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground">
            {v.description}
          </p>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="History" title="Voucher timeline">
        <VoucherTimeline events={v.timeline} />
      </SectionBlock>

      <SectionBlock eyebrow="Review" title={reviewed ? "Already reviewed" : "Decide this voucher"}>
        {reviewed ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            This voucher has already been reviewed. Its status is shown above and the employee can
            see the outcome in their voucher history.
          </p>
        ) : (
          <>
            <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
              Approving or disapproving this voucher updates its status and is visible to the
              employee immediately. The change is recorded in the timeline below.
            </p>
            <div className="flex flex-wrap gap-8">
              <Button size="lg" onClick={() => setPending("Approved")}>
                Approve
              </Button>
              <Button size="lg" variant="destructive" onClick={() => setPending("Disapproved")}>
                Disapprove
              </Button>
            </div>
          </>
        )}
      </SectionBlock>

      <VoucherModal
        open={pending !== null}
        onClose={() => setPending(null)}
        eyebrow="Review voucher"
        title={pending === "Approved" ? "Approve this voucher?" : "Disapprove this voucher?"}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={pending === "Disapproved" ? "destructive" : "default"}
              onClick={confirmReview}
            >
              Confirm
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="eyebrow">Admin note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add a note for the employee…"
            className="mt-2 w-full resize-none border-b border-border bg-transparent py-3 text-[15px] text-foreground outline-none transition-colors duration-500 placeholder:text-muted-foreground/60 focus:border-foreground/40"
          />
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          {pending === "Approved"
            ? "The voucher will be marked Approved and the employee will see it in their voucher history."
            : "The voucher will be marked Disapproved and your note (if any) will be shown to the employee in their voucher history."}
        </p>
      </VoucherModal>
    </>
  );
}
