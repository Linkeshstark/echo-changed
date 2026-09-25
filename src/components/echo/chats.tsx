import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Image as ImageIcon, Mic, Paperclip, Phone, Send, Smile, Users } from "lucide-react";
import { AppShell } from "./app-shell";
import { CallButton } from "./call-button";
import { Eyebrow, PageHeader } from "./primitives";
import { Button } from "@/components/ui/button";
import { chatEmojis, getGroup, markRead, sendMessage, useChatGroups } from "@/lib/echo-chats";
import { clientProfile } from "@/lib/echo-ops-data";
import { employeeByName, employeePhoneOf } from "@/lib/echo-modules-data";
import { cn } from "@/lib/utils";

/* ---------------- Group list (first screen) ---------------- */

export function ChatsPage() {
  const groups = useChatGroups();

  return (
    <AppShell>
      <PageHeader title="Group Chat" eyebrow="Communication" />

      <div data-reveal>
        <div className="hidden grid-cols-[1fr_1fr_160px_90px] gap-6 border-b border-border py-3 md:grid">
          <span className="eyebrow">Group</span>
          <span className="eyebrow">Last message</span>
          <span className="eyebrow">Time</span>
          <span className="eyebrow text-right">Unread</span>
        </div>

        {groups.map((g) => (
          <Link
            key={g.id}
            to="/chats/$groupId"
            params={{ groupId: g.id }}
            className="grid gap-2 border-b border-border py-5 transition-opacity duration-500 hover:opacity-70 md:grid-cols-[1fr_1fr_160px_90px] md:items-center md:gap-6"
          >
            <span className="flex items-center gap-4">
              <span className="grid size-10 shrink-0 place-items-center border border-border bg-surface">
                <Users className="size-4 text-foreground" />
              </span>
              <span>
                <span className="block text-[15px] text-foreground">{g.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {g.kind} · {g.members.length} members
                </span>
              </span>
            </span>
            <span className="truncate text-sm text-muted-foreground">{g.lastMessage}</span>
            <span className="text-sm tabular-nums text-muted-foreground">{g.lastAt}</span>
            <span className="justify-self-end text-sm tabular-nums text-foreground md:text-right">
              {g.unread > 0 ? g.unread : "—"}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

/* ---------------- One group ---------------- */

export function ChatThreadPage() {
  const { groupId } = useParams({ from: "/chats/$groupId" });
  const group = useChatGroups().find((g) => g.id === groupId);
  const messageCount = group?.messages.length ?? 0;
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState<null | number>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorder = useRef<number | null>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (groupId) markRead(groupId);
  }, [groupId, messageCount]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messageCount]);

  useEffect(
    () => () => {
      if (recorder.current !== null) window.clearInterval(recorder.current);
    },
    [],
  );

  if (!group) {
    return (
      <AppShell>
        <PageHeader title="Group Chat" back={{ to: "/chats", label: "Group Chat" }} />
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          This group is no longer available.
        </p>
      </AppShell>
    );
  }

  const contactPhone = group.kind === "Client" ? clientProfile(group.name).phone : undefined;
  const memberPhone = (() => {
    const id = employeeByName(group.members[0] ?? "")?.id;
    return id ? employeePhoneOf(id) : undefined;
  })();

  const send = () => {
    const body = text.trim();
    if (!body && !pendingImage && !pendingFile) return;
    if (pendingImage) sendMessage(group.id, { kind: "image", image: pendingImage });
    else if (pendingFile) sendMessage(group.id, { kind: "file", fileName: pendingFile });
    else sendMessage(group.id, { kind: "text", text: body });
    setText("");
    setPendingImage(null);
    setPendingFile(null);
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingFile(f.name);
    e.target.value = "";
  };

  const toggleRecording = () => {
    if (recorder.current !== null) {
      window.clearInterval(recorder.current);
      recorder.current = null;
      setRecording(null);
      sendMessage(group.id, {
        kind: "voice",
        duration: `0:${String(elapsed.current).padStart(2, "0")}`,
      });
      return;
    }
    elapsed.current = 0;
    setRecording(0);
    const started = Date.now();
    recorder.current = window.setInterval(() => {
      const secs = Math.floor((Date.now() - started) / 1000);
      elapsed.current = secs;
      setRecording(secs);
      if (secs >= 59) toggleRecording();
    }, 1000);
  };

  return (
    <AppShell>
      <PageHeader
        title={group.name}
        eyebrow={`Group Chat · ${group.kind}`}
        back={{ to: "/chats", label: "Group Chat" }}
      />

      <div data-reveal className="grid gap-10 lg:grid-cols-[1fr_260px]">
        <div className="flex h-[62vh] flex-col border border-border">
          <div className="flex items-center justify-between gap-6 border-b border-border px-5 py-4">
            <span className="text-sm text-muted-foreground">
              {group.members.length} members · {group.kind}
            </span>
            <CallButton phone={contactPhone ?? memberPhone} name={group.name} tone="solid" />
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {group.messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex flex-col gap-1.5", m.mine ? "items-end" : "items-start")}
              >
                {!m.mine && (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {m.author}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[78%] px-4 py-3 text-[15px] leading-relaxed",
                    m.mine
                      ? "bg-foreground text-background"
                      : "border border-border bg-surface text-foreground",
                  )}
                >
                  {m.kind === "text" && <span>{m.text}</span>}

                  {m.kind === "image" && (
                    <span>
                      {m.image && (
                        <img src={m.image} alt="" className="mb-2 max-h-64 w-full object-cover" />
                      )}
                      {m.text && <span className="block">{m.text}</span>}
                    </span>
                  )}

                  {m.kind === "voice" && (
                    <span className="flex items-center gap-3">
                      <Mic className="size-4" />
                      <span className="h-px w-24 bg-current/40" />
                      <span className="tabular-nums">{m.duration}</span>
                    </span>
                  )}

                  {m.kind === "file" && (
                    <span className="flex items-center gap-3">
                      <Paperclip className="size-4" />
                      <span>{m.fileName}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">{m.at}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {pendingImage && (
            <div className="flex items-center gap-4 border-t border-border px-5 py-3">
              <img src={pendingImage} alt="" className="h-16 w-16 object-cover" />
              <span className="text-xs text-muted-foreground">Ready to send</span>
              <button
                type="button"
                className="ml-auto text-xs uppercase tracking-[0.14em] text-muted-foreground hover:opacity-60"
                onClick={() => setPendingImage(null)}
              >
                Remove
              </button>
            </div>
          )}
          {pendingFile && (
            <div className="flex items-center gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground">
              <Paperclip className="size-4" />
              {pendingFile}
              <button
                type="button"
                className="ml-auto text-xs uppercase tracking-[0.14em] text-muted-foreground hover:opacity-60"
                onClick={() => setPendingFile(null)}
              >
                Remove
              </button>
            </div>
          )}

          <div className="border-t border-border p-4">
            {emojiOpen && (
              <div className="mb-3 flex flex-wrap gap-1">
                {chatEmojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setText((t) => t + e);
                      setEmojiOpen(false);
                    }}
                    className="grid size-9 place-items-center text-lg transition-opacity duration-500 hover:opacity-60"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Attach a file"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Send an image"
                onClick={() => imageRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Insert an emoji"
                onClick={() => setEmojiOpen(!emojiOpen)}
              >
                <Smile className="size-4" />
              </Button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message"
                className="h-11 flex-1 border-b border-border bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <Button
                type="button"
                size="icon"
                variant={recording !== null ? "destructive" : "ghost"}
                aria-label="Record a voice note"
                onClick={toggleRecording}
              >
                <Mic className="size-4" />
              </Button>
              <Button type="button" size="icon" aria-label="Send" onClick={send}>
                <Send className="size-4" />
              </Button>
            </div>
            {recording !== null && (
              <p className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-destructive">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                Recording · 0:{String(recording).padStart(2, "0")}
              </p>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImage}
            />
            <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
          </div>
        </div>

        <div>
          <Eyebrow className="mb-4">Members</Eyebrow>
          <ul>
            {group.members.map((mname) => {
              const id = employeeByName(mname)?.id;
              return (
                <li
                  key={mname}
                  className="flex items-center justify-between gap-4 border-b border-border py-4"
                >
                  <span className="text-[15px] text-foreground">{mname}</span>
                  {id && <CallButton phone={employeePhoneOf(id)} name={mname} />}
                </li>
              );
            })}
          </ul>

          <Eyebrow className="mt-10 mb-4">Group</Eyebrow>
          <div className="border-b border-border py-4">
            <p className="flex items-center gap-3 text-sm text-foreground">
              <Phone className="size-3.5" /> {contactPhone ?? "Internal group"}
            </p>
            {contactPhone && <CallButton phone={contactPhone} name={group.name} className="mt-3" />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
