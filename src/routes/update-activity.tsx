import { createFileRoute } from "@tanstack/react-router";
import { UpdateActivityPage } from "@/components/echo/raised-activity";
export const Route = createFileRoute("/update-activity")({
  head: () => ({
    meta: [
      { title: "Update Raised Activity — ECHO" },
      {
        name: "description",
        content: "Change the status, assignee, or notes of any raised activity.",
      },
      { property: "og:title", content: "Update Raised Activity — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UpdateActivityPage,
});
