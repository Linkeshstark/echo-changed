import { useMemo, useState } from "react";
import { Check, HeartHandshake, Plus, Search, X } from "lucide-react";
import { AppShell } from "./app-shell";
import { Eyebrow, KpiBand, Modal, PageHeader, SelectField, TextField } from "./primitives";
import { SectionBlock, StatusPill } from "./employee-detail";
import { Button } from "@/components/ui/button";
import { CallButton } from "./call-button";
import {
  addDonation,
  donationPurposes,
  donationTotals,
  inr,
  reviewDonation,
  useDonations,
  type DonationPurpose,
  type DonationRecord,
} from "@/lib/echo-donations";
import { cn } from "@/lib/utils";

/* ---------------- Donation dashboard ---------------- */

export function DonationPage() {
  const donations = useDonations();
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("All");
  const [status, setStatus] = useState("All");
  const [mode, setMode] = useState("All");
  const [open, setOpen] = useState(false);

  const totals = donationTotals(donations);

  const visible = donations.filter((d) => {
    const text =
      `${d.code} ${d.donor} ${d.email} ${d.purpose} ${d.purposeNote ?? ""}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (purpose === "All" || d.purpose === purpose) &&
      (status === "All" || d.status === status) &&
      (mode === "All" || d.mode === mode)
    );
  });

  return (
    <AppShell>
      <PageHeader title="Donation" eyebrow="Contributions" />

      <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Donations received by ECHO, their purpose, and the approval status of each receipt.
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add Donation
        </Button>
      </div>

      <KpiBand
        items={[
          { label: "Total Donations", value: inr(totals.totalAmount), note: "All records" },
          {
            label: "Approved",
            value: inr(totals.approvedAmount),
            note: `${totals.approvedCount} receipts`,
          },
          { label: "Pending", value: String(totals.pendingCount), note: "Awaiting review" },
          { label: "Average Gift", value: inr(totals.average), note: "Approved only" },
        ]}
      />

      <div className="mt-14 grid gap-x-12 gap-y-8 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search donor, code, purpose…"
            className="h-12 w-full border-b border-border bg-transparent pl-7 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <SelectField label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option>All</option>
          {donationPurposes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </SelectField>
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {["Pending", "Approved", "Rejected"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <SelectField label="Payment mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option>All</option>
          {["UPI", "Bank Transfer", "Cash", "Cheque"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </SelectField>
      </div>

      <div data-reveal>
        <div className="hidden grid-cols-[56px_1fr_160px_170px_130px_150px_130px_200px] gap-6 border-b border-border py-3 lg:grid">
          <span className="eyebrow">No.</span>
          <span className="eyebrow">Donor</span>
          <span className="eyebrow">Purpose</span>
          <span className="eyebrow">Amount</span>
          <span className="eyebrow">Mode</span>
          <span className="eyebrow">Received</span>
          <span className="eyebrow">Status</span>
          <span className="eyebrow text-right">Action</span>
        </div>

        {visible.length === 0 && (
          <p className="border-b border-border py-8 text-sm text-muted-foreground">
            No donations match these filters.
          </p>
        )}

        {visible.map((d, i) => (
          <div
            key={d.code}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 lg:grid lg:grid-cols-[56px_1fr_160px_170px_130px_150px_130px_200px] lg:items-center lg:gap-6"
          >
            <span className="hidden text-xs tabular-nums text-muted-foreground lg:block">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <span className="block text-[15px] text-foreground">{d.donor}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {d.code} · {d.email} · {d.date}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {d.purpose}
              {d.purposeNote ? (
                <span className="mt-0.5 block text-xs text-muted-foreground/80">
                  {d.purposeNote}
                </span>
              ) : null}
            </span>
            <span className="text-[15px] tabular-nums text-foreground">{inr(d.amount)}</span>
            <span className="text-sm text-muted-foreground">{d.mode}</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {d.time}, {d.date}
            </span>
            <span>
              <StatusPill status={d.status} />
            </span>
            <span className="flex items-center justify-end gap-3">
              <CallButton phone={d.phone} name={d.donor} />
              <DonationActions d={d} />
            </span>
          </div>
        ))}
      </div>

      <DonationBreakdown />

      <NewDonationModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}

/* ---------------- Approve / reject ---------------- */

function DonationActions({ d }: { d: DonationRecord }) {
  const [review, setReview] = useState<null | "Approved" | "Rejected">(null);
  const [note, setNote] = useState("");

  if (d.status !== "Pending") {
    return (
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {d.receiptNo ? `Receipt ${d.receiptNo}` : "Reviewed"}
      </span>
    );
  }

  const confirm = () => {
    if (!review) return;
    reviewDonation(d.code, review, note.trim() || undefined);
    setNote("");
    setReview(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setReview("Approved")}>
          <Check className="size-3.5" /> Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setReview("Rejected")}>
          <X className="size-3.5" /> Reject
        </Button>
      </div>
      <Modal
        open={review !== null}
        onClose={() => setReview(null)}
        title={review === "Approved" ? "Approve donation" : "Reject donation"}
        eyebrow={`${d.code} · ${inr(d.amount)}`}
        onSave={confirm}
        saveLabel={review === "Approved" ? "Approve Donation" : "Reject Donation"}
      >
        <div className="grid gap-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {d.donor} · {d.purpose} · {d.mode} — {inr(d.amount)}
          </p>
          <label className="block">
            <span className="eyebrow">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for the record…"
              className="mt-2 w-full resize-y border-b border-border bg-transparent py-3 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

/* ---------------- Add donation ---------------- */

function NewDonationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [purpose, setPurpose] = useState<DonationPurpose>("Community");
  const [saved, setSaved] = useState("");

  const modes = useMemo(() => ["UPI", "Bank Transfer", "Cash", "Cheque"], []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Donation"
      eyebrow="Contributions"
      onSave={(form) => {
        const amount = Number(form.get("donationAmount"));
        const donor = String(form.get("donationDonor") ?? "").trim();
        const email = String(form.get("donationEmail") ?? "").trim();
        const phone = String(form.get("donationPhone") ?? "").trim();
        const mode = String(form.get("donationMode") ?? "UPI");
        const note = String(form.get("donationPurposeNote") ?? "").trim();
        if (!amount || amount < 1 || !donor) return;
        const created = addDonation({
          donor,
          email,
          phone,
          amount,
          mode: modes.includes(mode) ? (mode as DonationRecord["mode"]) : "UPI",
          purpose,
          ...(note ? { purposeNote: note } : {}),
        });
        setSaved(created.code);
        onClose();
      }}
      saveLabel="Save Donation"
    >
      <div className="grid gap-9">
        <TextField label="Donor name" name="donationDonor" required maxLength={80} />
        <TextField label="Email" name="donationEmail" type="email" maxLength={120} />
        <TextField label="Phone" name="donationPhone" type="tel" maxLength={20} />
        <TextField label="Donation amount" name="donationAmount" type="number" min="1" required />
        <SelectField
          label="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as DonationPurpose)}
        >
          {donationPurposes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
        {purpose === "Other (manual)" ? (
          <TextField
            label="Describe the purpose"
            name="donationPurposeNote"
            required
            maxLength={120}
          />
        ) : null}
        <SelectField label="Payment mode" name="donationMode" defaultValue="UPI">
          {modes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectField>
        {saved ? (
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Last saved — {saved}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

/* ---------------- Purpose breakdown ---------------- */

export function DonationBreakdown() {
  const donations = useDonations();
  const rows = donationPurposes
    .map((p) => ({
      purpose: p,
      amount: donations
        .filter((d) => d.purpose === p && d.status === "Approved")
        .reduce((sum, d) => sum + d.amount, 0),
      count: donations.filter((d) => d.purpose === p && d.status === "Approved").length,
    }))
    .filter((r) => r.count > 0);

  return (
    <SectionBlock eyebrow="Allocation" title="Where the funds go">
      <div className="grid gap-x-16 gap-y-6 md:grid-cols-2">
        {rows.map((r) => (
          <div key={r.purpose} className="hairline-b flex items-center justify-between gap-6 py-4">
            <span className="flex items-center gap-3 text-sm text-muted-foreground">
              <HeartHandshake className="size-4" />
              {r.purpose}
              <span className={cn("text-xs text-muted-foreground/70")}>
                ({r.count} {r.count === 1 ? "gift" : "gifts"})
              </span>
            </span>
            <span className="text-[15px] tabular-nums text-foreground">{inr(r.amount)}</span>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}
