import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — ECHO" },
      { name: "description", content: "Contact Xelevate support for the ECHO workspace." },
      { property: "og:title", content: "Help — ECHO" },
      { property: "og:description", content: "Contact Xelevate support for the ECHO workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});
