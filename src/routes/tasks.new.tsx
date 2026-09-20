import { createFileRoute } from "@tanstack/react-router";
import { NewTaskPage } from "@/components/echo/form-pages";
export const Route = createFileRoute("/tasks/new")({
  head: () => ({
    meta: [
      { title: "Create New Task — ECHO" },
      { name: "description", content: "Assign, schedule, and define evidence for a new task." },
      { property: "og:title", content: "Create New Task — ECHO" },
      {
        property: "og:description",
        content: "Assign, schedule, and define evidence for a new task.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewTaskPage,
});
