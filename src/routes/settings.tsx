import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile Settings — ECHO" },
      { name: "description", content: "Manage administrator profile and appearance." },
      { property: "og:title", content: "Profile Settings — ECHO" },
      { property: "og:description", content: "Manage administrator profile and appearance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});
