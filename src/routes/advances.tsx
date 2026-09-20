import { createFileRoute } from "@tanstack/react-router";
import { AdvancesPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/advances")({
  head: () => ({
    meta: [
      { title: "Advances — ECHO" },
      { name: "description", content: "Manage employee salary advances and history." },
      { property: "og:title", content: "Advances — ECHO" },
      { property: "og:description", content: "Manage employee salary advances and history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdvancesPage,
});
