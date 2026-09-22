import { createFileRoute } from "@tanstack/react-router";
import { BillBookPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/bill-book/")({
  head: () => ({
    meta: [
      { title: "Bill Book — ECHO" },
      { name: "description", content: "Manage ECHO quotations, invoices, and bills." },
      { property: "og:title", content: "Bill Book — ECHO" },
      { property: "og:description", content: "Manage ECHO quotations, invoices, and bills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BillBookPage,
});
