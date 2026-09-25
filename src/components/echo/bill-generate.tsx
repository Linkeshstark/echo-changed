import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BadgeIndianRupee, Download, FileSliders, ReceiptText, Stamp, Truck } from "lucide-react";
import { AppShell } from "./app-shell";
import { Eyebrow, Modal, PageHeader, SaveBar, SelectField, TextField } from "./primitives";
import { Button } from "@/components/ui/button";
import {
  clientProfiles,
  docTypeMeta,
  generatedDocuments,
  addGeneratedDocument,
  type DocType,
} from "@/lib/echo-ops-data";

export const DOC_ROUTE: Record<DocType, string> = {
  Quotation: "quotation",
  Invoice: "invoice",
  Bill: "bill",
  Voucher: "voucher",
  "Delivery Challan": "delivery-challan",
};

export function docTypeOfRoute(route: string): DocType {
  const match = (Object.entries(DOC_ROUTE) as Array<[DocType, string]>).find(
    ([, r]) => r === route,
  );
  return match?.[0] ?? "Quotation";
}

/* ---------------- Generate Bill Book documents ---------------- */

export function GenerateDocPage({ type, label }: { type: DocType; label: string }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addGeneratedDocument({
      type,
      client,
      amount: String(Number(amount) || 0),
      status: "Draft",
    });
    setSaved(true);
    window.setTimeout(() => navigate({ to: "/bill-book" }), 700);
  };

  return (
    <AppShell>
      <PageHeader
        title={label}
        eyebrow="Bill Book"
        back={{ to: "/bill-book", label: "Bill Book" }}
      />
      <form onSubmit={submit} className="pb-8">
        <section className="py-12 md:py-16">
          <Eyebrow className="mb-4">01</Eyebrow>
          <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Party details</h2>
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <SelectField
              label="Select client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
            >
              <option value="">Choose a client</option>
              {Object.values(clientProfiles).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <Eyebrow className="mb-4">02</Eyebrow>
          <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Amount</h2>
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            <div className="relative">
              <TextField
                label="Amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <span className="absolute right-0 top-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Currency — INR
              </span>
            </div>
            {amount && (
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  Amount —{" "}
                  <span className="text-[15px] text-foreground">
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
        <section className="py-12 md:py-16">
          <Eyebrow className="mb-4">03</Eyebrow>
          <h2 className="glyph-serif mb-8 text-3xl text-foreground md:text-4xl">Note</h2>
          <TextField
            label="Description / note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            maxLength={200}
            placeholder=" "
          />
        </section>
        <SaveBar label={label} />
      </form>
      {saved && (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-enter bg-foreground px-6 py-3 text-sm text-background">
          {label} generated — added to Bill Book
        </div>
      )}
    </AppShell>
  );
}

/* ---------------- Generate modal (options) ---------------- */

export function GenerateDocModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const options: Array<{ type: DocType; icon: typeof FileSliders; desc: string }> = [
    { type: "Quotation", icon: FileSliders, desc: "Sales quotation for a client" },
    { type: "Invoice", icon: ReceiptText, desc: "Tax invoice for services rendered" },
    { type: "Bill", icon: Stamp, desc: "Service bill / work bill" },
    { type: "Voucher", icon: BadgeIndianRupee, desc: "Payment voucher for a transaction" },
    {
      type: "Delivery Challan",
      icon: Truck,
      desc: "Goods delivery challan for a dispatch",
    },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Generate" eyebrow="Bill Book">
      <div className="relative">
        {options.map(({ type, icon: Icon, desc }, i) => {
          const meta = docTypeMeta[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                onClose();
                navigate({ to: "/bill-book/$type/new", params: { type: DOC_ROUTE[type] } });
              }}
              className="group flex w-full items-center gap-5 border-b border-border py-5 text-left transition-opacity duration-500 hover:opacity-60"
            >
              <span className="grid size-11 shrink-0 place-items-center border border-border bg-surface">
                <Icon className="size-5 text-foreground" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] text-foreground">
                  {meta.label} <span className="ml-2 text-xs text-muted-foreground">#Meta</span>
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
              </span>
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

/* ---------------- Bill Book document rows (appended) ---------------- */

export function GeneratedDocRows() {
  if (generatedDocuments.length === 0) return null;
  return (
    <div className="mt-4">
      {generatedDocuments.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-6 border-b border-border py-5"
        >
          <div className="flex min-w-0 items-center gap-5">
            <span className="grid size-10 shrink-0 place-items-center border border-border bg-surface">
              <ReceiptText className="size-4 text-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] text-foreground">
                {docTypeMeta[doc.type].label}{" "}
                <span className="ml-2 text-xs text-muted-foreground">#{doc.id}</span>
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {doc.client} · {doc.date} · {doc.status}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <span className="text-sm tabular-nums text-foreground">
              ₹{Number(doc.amount).toLocaleString("en-IN")}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const a = document.createElement("a");
                a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
                  `${docTypeMeta[doc.type].label.toUpperCase()}\n${doc.id}\n${doc.client}\n₹${doc.amount}\n${doc.status}`,
                )}`;
                a.download = `${doc.id}.txt`;
                a.click();
              }}
            >
              <Download className="size-3.5" /> Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocTypeDisclaimer() {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      Quick-generated documents create a draft record in the Bill Book. Downloading saves a plain
      text preview.
    </p>
  );
}
