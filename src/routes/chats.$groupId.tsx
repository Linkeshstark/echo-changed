import { createFileRoute } from "@tanstack/react-router";
import { ChatThreadPage } from "@/components/echo/chats";
export const Route = createFileRoute("/chats/$groupId")({
  head: () => ({
    meta: [
      { title: "Group Chat — ECHO" },
      { name: "description", content: "Message an ECHO group." },
      { property: "og:title", content: "Group Chat — ECHO" },
      { property: "og:description", content: "Message an ECHO group." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatThreadPage,
});
