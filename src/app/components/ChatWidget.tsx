"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const welcome: Message = {
  role: "assistant",
  content: "Hi! I’m the BreathEasy assistant. Ask me about services, pricing, filter sizes, or getting started.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.message || "Sorry, I couldn’t answer that. Please try again." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I’m having trouble connecting, but you can call us at (470) 470-5493, Monday through Saturday, 8am to 6pm." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <section
          className="mb-4 flex h-[min(520px,calc(100vh-110px))] w-[calc(100vw-40px)] max-w-sm flex-col overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-2xl shadow-cyan-900/20"
          aria-label="BreathEasy chat"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-4 text-white">
            <div>
              <p className="font-bold">BreathEasy Assistant</p>
              <p className="text-xs text-cyan-50">Here to help</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 hover:bg-white/15">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-cyan-50/60 to-white p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-cyan-600 text-white" : "rounded-bl-md border border-gray-100 bg-white text-gray-700 shadow-sm"}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {loading && <p className="w-fit rounded-2xl rounded-bl-md bg-white px-4 py-2 text-sm text-gray-400 shadow-sm">Thinking…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-gray-100 bg-white p-3">
            <label htmlFor="chat-message" className="sr-only">Message</label>
            <input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
            <button disabled={loading || !input.trim()} aria-label="Send message" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 text-white shadow-md disabled:opacity-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </section>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close BreathEasy chat" : "Open BreathEasy chat"}
        aria-expanded={open}
        className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 text-white shadow-xl shadow-cyan-600/30 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200"
      >
        {open ? (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.2 10.2 0 01-4.4-.98L3 20l1.35-3.6A7.35 7.35 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </div>
  );
}
