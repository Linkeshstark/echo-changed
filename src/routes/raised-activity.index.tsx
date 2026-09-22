import { createFileRoute } from "@tanstack/react-router";
import { RaisedActivityPage } from "@/components/echo/raised-activity";
export const Route = createFileRoute("/raised-activity/")({
  head: () => ({
    meta: [
      { title: "Raised Activity — ECHO" },
      { name: "description", content: "Review client complaints raised to the service desk." },
      { property: "og:title", content: "Raised Activity — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RaisedActivityPage,
});
