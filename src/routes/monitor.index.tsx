import { createFileRoute } from "@tanstack/react-router";
import { MonitorPage } from "@/components/echo/monitor";
export const Route = createFileRoute("/monitor/")({
  head: () => ({
    meta: [
      { title: "Employee Monitor — ECHO" },
      { name: "description", content: "Monitor every employee's work, attendance, and records." },
      { property: "og:title", content: "Employee Monitor — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonitorPage,
});
