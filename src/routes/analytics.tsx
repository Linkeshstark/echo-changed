import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Overall Company Data — ECHO" },
      { name: "description", content: "View ECHO company performance and recent activity." },
      { property: "og:title", content: "Overall Company Data — ECHO" },
      { property: "og:description", content: "View ECHO company performance and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});
