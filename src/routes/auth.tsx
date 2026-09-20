import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/echo/auth-page";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authentication — ECHO" },
      { name: "description", content: "Sign in or create an ECHO administrator account." },
      { property: "og:title", content: "Authentication — ECHO" },
      { property: "og:description", content: "Sign in or create an ECHO administrator account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});
