import { createFileRoute } from "@tanstack/react-router";
import { TaskSubmissionsPage } from "@/components/echo/task-submissions";
export const Route = createFileRoute("/submissions/")({
  head: () => ({
    meta: [
      { title: "Task Submissions — ECHO" },
      { name: "description", content: "Verify employee work submissions and evidence." },
      { property: "og:title", content: "Task Submissions — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaskSubmissionsPage,
});
