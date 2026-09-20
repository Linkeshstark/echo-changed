import { createFileRoute } from "@tanstack/react-router";
import { NewEmployeePage } from "@/components/echo/form-pages";
export const Route = createFileRoute("/employees/new")({
  head: () => ({
    meta: [
      { title: "Create New Employee — ECHO" },
      { name: "description", content: "Add employee, banking, employment, and portal details." },
      { property: "og:title", content: "Create New Employee — ECHO" },
      {
        property: "og:description",
        content: "Add employee, banking, employment, and portal details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewEmployeePage,
});
