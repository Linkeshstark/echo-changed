import { createFileRoute } from "@tanstack/react-router";
import { AdvancesPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/advances")({
  head: () => ({
    meta: [
      { title: "Update Salary — ECHO" },
      {
        name: "description",
        content: "Update salary advances and deductions for employees.",
      },
      { property: "og:title", content: "Update Salary — ECHO" },
      {
        property: "og:description",
        content: "Update salary advances and deductions for employees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdvancesPage,
});
