import { createFileRoute } from "@tanstack/react-router";
import { NewClientPage } from "@/components/echo/form-pages";
export const Route = createFileRoute("/clients/new")({
  head: () => ({
    meta: [
      { title: "Create New Client — ECHO" },
      { name: "description", content: "Create a client workspace and dedicated group chat." },
      { property: "og:title", content: "Create New Client — ECHO" },
      {
        property: "og:description",
        content: "Create a client workspace and dedicated group chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewClientPage,
});
