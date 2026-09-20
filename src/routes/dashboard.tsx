import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/echo/dashboard";
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ECHO" },
      { name: "description", content: "Manage today’s ECHO tasks and quick actions." },
      { property: "og:title", content: "Dashboard — ECHO" },
      { property: "og:description", content: "Manage today’s ECHO tasks and quick actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
