import { createFileRoute } from "@tanstack/react-router";
import { VaultPage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Personal Vault — ECHO" },
      { name: "description", content: "Organize private ECHO folders and files." },
      { property: "og:title", content: "Personal Vault — ECHO" },
      { property: "og:description", content: "Organize private ECHO folders and files." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaultPage,
});
