import { createFileRoute } from "@tanstack/react-router";
import { ChatsPage } from "@/components/echo/chats";
export const Route = createFileRoute("/chats/")({
  head: () => ({
    meta: [
      { title: "Group Chats — ECHO" },
      { name: "description", content: "Communicate with ECHO client groups." },
      { property: "og:title", content: "Group Chats — ECHO" },
      { property: "og:description", content: "Communicate with ECHO client groups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatsPage,
});
