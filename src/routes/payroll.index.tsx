import { createFileRoute } from "@tanstack/react-router";
import { PayrollPage } from "@/components/echo/payroll";
export const Route = createFileRoute("/payroll/")({
  head: () => ({
    meta: [
      { title: "Payroll — ECHO" },
      { name: "description", content: "Manage monthly employee salary payments." },
      { property: "og:title", content: "Payroll — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PayrollPage,
});
