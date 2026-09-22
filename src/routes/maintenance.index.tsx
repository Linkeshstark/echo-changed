import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceChartPage } from "@/components/echo/maintenance";
export const Route = createFileRoute("/maintenance/")({
  head: () => ({
    meta: [
      { title: "Maintenance Chart — ECHO" },
      { name: "description", content: "Track every maintenance record across all clients." },
      { property: "og:title", content: "Maintenance Chart — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaintenanceChartPage,
});
