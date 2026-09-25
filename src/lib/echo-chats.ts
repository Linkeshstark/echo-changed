/*
 * Group Chat — mock threads. The list screen is the entry point; a group opens
 * on its own page. Images and voice notes are held in memory for the session.
 */

import { useSyncExternalStore } from "react";

export type ChatMessage = {
  id: string;
  mine: boolean;
  author: string;
  kind: "text" | "image" | "voice" | "file";
  text?: string;
  image?: string;
  fileName?: string;
  duration?: string;
  at: string;
};

export type ChatGroup = {
  id: string;
  name: string;
  kind: "Client" | "Internal";
  members: string[];
  unread: number;
  lastMessage: string;
  lastAt: string;
  messages: ChatMessage[];
};

function time(d: Date = new Date()) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

let groups: ChatGroup[] = [
  {
    id: "abc-residential",
    name: "ABC Residential",
    kind: "Client",
    members: ["Arjun Mehta", "Maya Iyer", "Kavya Menon"],
    unread: 3,
    lastMessage: "Gate 2 repair is scheduled for Friday morning.",
    lastAt: "9:42 AM",
    messages: [
      {
        id: "a1",
        mine: false,
        author: "Kavya Menon",
        kind: "text",
        text: "Morning team — the west gate intercom is not working again.",
        at: "9:12 AM",
      },
      {
        id: "a2",
        mine: true,
        author: "You",
        kind: "text",
        text: "Noted. Sending a technician today before the evening shift.",
        at: "9:18 AM",
      },
      {
        id: "a3",
        mine: false,
        author: "Arjun Mehta",
        kind: "image",
        text: "This is the panel we saw on site.",
        at: "9:31 AM",
      },
      {
        id: "a4",
        mine: true,
        author: "You",
        kind: "voice",
        duration: "0:24",
        at: "9:35 AM",
      },
      {
        id: "a5",
        mine: false,
        author: "Kavya Menon",
        kind: "text",
        text: "Gate 2 repair is scheduled for Friday morning.",
        at: "9:42 AM",
      },
    ],
  },
  {
    id: "greentech",
    name: "GreenTech",
    kind: "Client",
    members: ["Dev Kumar", "Sara Khan", "Ravi Menon"],
    unread: 1,
    lastMessage: "Please share the updated service schedule.",
    lastAt: "8:15 AM",
    messages: [
      {
        id: "g1",
        mine: false,
        author: "Dev Kumar",
        kind: "text",
        text: "Please share the updated service schedule.",
        at: "8:15 AM",
      },
      {
        id: "g2",
        mine: true,
        author: "You",
        kind: "text",
        text: "Drafting it now — will share before noon.",
        at: "8:20 AM",
      },
    ],
  },
  {
    id: "aster-labs",
    name: "Aster Labs",
    kind: "Client",
    members: ["Arjun Mehta", "Maya Iyer"],
    unread: 0,
    lastMessage: "Invoice INV-2048 has been settled.",
    lastAt: "Yesterday",
    messages: [
      {
        id: "s1",
        mine: false,
        author: "Arjun Mehta",
        kind: "text",
        text: "Invoice INV-2048 has been settled.",
        at: "Yesterday · 6:04 PM",
      },
      {
        id: "s2",
        mine: true,
        author: "You",
        kind: "text",
        text: "Thank you — receipt acknowledged on our side.",
        at: "Yesterday · 6:10 PM",
      },
    ],
  },
  {
    id: "internal-operations",
    name: "Internal Operations",
    kind: "Internal",
    members: ["Maya Iyer", "Dev Kumar", "Sara Khan", "Kavya Menon"],
    unread: 0,
    lastMessage: "Stand-up moved to 9:00 AM tomorrow.",
    lastAt: "Mon",
    messages: [
      {
        id: "i1",
        mine: false,
        author: "Maya Iyer",
        kind: "text",
        text: "Stand-up moved to 9:00 AM tomorrow.",
        at: "Mon · 7:40 PM",
      },
      {
        id: "i2",
        mine: true,
        author: "You",
        kind: "text",
        text: "Noted. I will bring the maintenance chart.",
        at: "Mon · 7:52 PM",
      },
    ],
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useChatGroups(): ChatGroup[] {
  return useSyncExternalStore(
    subscribe,
    () => groups,
    () => groups,
  );
}

export function getGroup(id: string): ChatGroup | undefined {
  return groups.find((g) => g.id === id);
}

export function markRead(id: string) {
  groups = groups.map((g) => (g.id === id ? { ...g, unread: 0 } : g));
  emit();
}

export function sendMessage(id: string, msg: Omit<ChatMessage, "id" | "at" | "mine" | "author">) {
  const at = time();
  groups = groups.map((g) =>
    g.id === id
      ? {
          ...g,
          lastMessage:
            msg.text ||
            (msg.kind === "image" ? "Photo" : msg.kind === "voice" ? "Voice note" : "Attachment"),
          lastAt: at,
          messages: [
            ...g.messages,
            {
              ...msg,
              id: `${id}-${Date.now()}`,
              at,
              mine: true,
              author: "You",
            },
          ],
        }
      : g,
  );
  emit();
}

export const chatEmojis = ["😀", "👍", "🙏", "✅", "🎉", "🔥", "😅", "👌", "💡", "📌", "🤝", "❤️"];
