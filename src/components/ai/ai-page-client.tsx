"use client";

import { Bot, Plus, Send, Trash2, User2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

export function AiPageClient({
  initialSessions,
  initialMessages,
  initialSessionId,
}: {
  initialSessions: ChatSession[];
  initialMessages: ChatMessage[];
  initialSessionId: string | null;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [messages, setMessages] = useState(initialMessages);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSession(sessionId: string) {
    setActiveSessionId(sessionId);
    const response = await fetch(`/api/ai/sessions/${sessionId}`);
    const data = await response.json();
    setMessages(data.messages || []);
  }

  async function startNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
  }

  async function deleteSession(sessionId: string) {
    await fetch(`/api/ai/sessions/${sessionId}`, { method: "DELETE" });
    const remaining = sessions.filter((session) => session.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      if (remaining[0]) {
        await loadSession(remaining[0].id);
      } else {
        await startNewChat();
      }
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      session_id: activeSessionId || "draft",
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    const assistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      session_id: activeSessionId || "draft",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, message: userMessage.content }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const errorMessage = errorPayload?.error || "AI request failed. Check your Gemini API key and model access.";
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: errorMessage } : message,
          ),
        );
        setLoading(false);
        return;
      }

      const sessionId = response.headers.get("x-session-id");
      const sessionTitle = response.headers.get("x-session-title");
      if (sessionId && (!activeSessionId || activeSessionId !== sessionId)) {
        setActiveSessionId(sessionId);
        setSessions((current) => {
          const exists = current.some((session) => session.id === sessionId);
          if (exists) return current;
          return [{ id: sessionId, title: sessionTitle || "New Chat", created_at: new Date().toISOString(), user_id: "" }, ...current];
        });
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: text, session_id: sessionId || message.session_id }
                : message,
            ),
          );
        }
      }

      if (sessionId) {
        const details = await fetch(`/api/ai/sessions/${sessionId}`);
        const data = await details.json();
        setMessages(data.messages || []);
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: "Unable to reach the AI service right now." }
            : message,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr] xl:gap-6">
      <Card className="order-2 overflow-hidden xl:order-1">
        <CardContent className="flex h-[220px] flex-col gap-3 p-3 sm:h-[260px] sm:p-4 xl:h-[75vh] xl:gap-4">
          <Button onClick={startNewChat} className="h-10"><Plus className="h-4 w-4" />New Chat</Button>
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-2 xl:pr-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start justify-between gap-3 rounded-2xl border px-3 py-3 transition sm:px-4 ${activeSessionId === session.id ? "border-primary bg-primary/10" : "border-transparent bg-secondary/30 hover:bg-secondary/50"}`}
                >
                  <button
                    type="button"
                    onClick={() => loadSession(session.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="line-clamp-1 font-medium">{session.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatShortDate(session.created_at)}</p>
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat session?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the session and all messages inside it.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSession(session.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {sessions.length === 0 && <p className="text-sm text-muted-foreground">No saved sessions yet.</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="order-1 overflow-hidden xl:order-2">
        <CardContent className="flex h-[calc(100dvh-11rem)] min-h-[480px] flex-col p-0 sm:h-[70vh] xl:h-[75vh]">
          <ScrollArea className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-4 pr-1 sm:space-y-6 sm:pr-3">
              {messages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:p-10">
                  Ask about spending habits, cash flow, or savings targets.
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex gap-2 sm:gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    {message.role === "assistant" && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10"><Bot className="h-4 w-4 sm:h-5 sm:w-5" /></div>}
                    <div className={`max-w-[85%] rounded-[24px] px-4 py-3 sm:max-w-3xl sm:rounded-3xl sm:px-5 sm:py-4 ${message.role === "assistant" ? "bg-secondary/50" : "bg-primary text-primary-foreground"}`}>
                      {message.role === "assistant" ? <div className="prose prose-invert max-w-none prose-p:my-2"><ReactMarkdown>{message.content || (loading ? "Thinking..." : "")}</ReactMarkdown></div> : <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                    {message.role === "user" && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground sm:h-10 sm:w-10"><User2 className="h-4 w-4 sm:h-5 sm:w-5" /></div>}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Finq AI..." className="h-11" onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }} />
              <Button onClick={handleSend} disabled={loading || !input.trim()} className="h-11 px-4 sm:px-5"><Send className="h-4 w-4" /><span className="hidden sm:inline">Send</span></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
