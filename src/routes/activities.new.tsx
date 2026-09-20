import { createFileRoute } from "@tanstack/react-router";
import { NewActivityPage } from "@/components/echo/form-pages";
export const Route = createFileRoute("/activities/new")({
  head: () => ({
    meta: [
      { title: "Create New Activity — ECHO" },
      { name: "description", content: "Log and assign a client service activity." },
      { property: "og:title", content: "Create New Activity — ECHO" },
      { property: "og:description", content: "Log and assign a client service activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewActivityPage,
});
