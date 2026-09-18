"use client";

import { FormEvent, useEffect, useState } from "react";

type Lead = { id: string; type: "Chat" | "Calls"; name: string; phone: string; transcript?: string; createdAt: string };
type SmsMessage = { id: string; direction: "inbound" | "outbound"; author: "caller" | "ai" | "agent" | "system"; body: string; createdAt: string; deliveryStatus?: string };
type MissedCallLead = { caller: string; phone: string; startedAt: string; messages: SmsMessage[]; status: "new" | "engaged" | "booked" | "closed"; lastAiReply: string | null; doNotText?: boolean; needsHuman?: boolean };
type Stats = {
  totalCalls: number; callsByDay: { date: string; count: number }[]; bookings: number; chats: number;
  afterHoursCount: number; topQuestions: { label: string; pct: number }[]; leads: Lead[];
  hoursSaved: number; costPerLead: number; period: string; sampleData: boolean;
  missedCallLeads: MissedCallLead[];
};

const colors = ["#0891b2", "#10b981", "#6366f1", "#f59e0b", "#94a3b8"];

function LeafIcon({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 24 24" className={small ? "h-5 w-5" : "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-8 10-15Z"/><path d="M4 20c3-6 7-9 13-12"/></svg>;
}

function SampleTag() {
  return <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">Sample data</span>;
}

function formatWhen(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const day = diff < 86400000 ? "Today" : diff < 172800000 ? "Yesterday" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function phone(value: string) {
  const digits = value.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : value;
}

function excerpt(value = "New service inquiry") {
  const clean = value.replace(/^(user|assistant):\s*/gim, "").replace(/\s+/g, " ").trim();
  return clean.length > 80 ? `${clean.slice(0, 77)}…` : clean;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [manualText, setManualText] = useState("");
  const [sendingText, setSendingText] = useState(false);
  const [textError, setTextError] = useState("");

  async function loadStats(value: string) {
    setLoading(true);
    const response = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${value}` }, cache: "no-store" });
    if (response.ok) {
      const data: Stats = await response.json();
      setStats(data); setToken(value);
      setSelectedPhone((current) => current || data.missedCallLeads[0]?.phone || "");
    }
    else { sessionStorage.removeItem("adminToken"); setToken(null); setError("Your session has expired. Please sign in again."); }
    setLoading(false);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("adminToken");
    if (!saved) return;
    const timer = window.setTimeout(() => void loadStats(saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode }) });
    if (!response.ok) { setError("That passcode isn’t correct."); setLoading(false); return; }
    const data = await response.json();
    sessionStorage.setItem("adminToken", data.token); await loadStats(data.token);
  }

  async function textNow(event: FormEvent) {
    event.preventDefault();
    if (!selectedPhone || !manualText.trim()) return;
    setSendingText(true); setTextError("");
    const response = await fetch("/api/admin/missed-calls", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ phone: selectedPhone, body: manualText.trim() }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setTextError(data.error || "The message could not be sent.");
    } else {
      setManualText(""); await loadStats(token!);
    }
    setSendingText(false);
  }

  if (!token || !stats) return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f0fdfa_0%,#f1f7f8_45%,#ecfeff_100%)] p-6">
      <div className="w-full max-w-sm rounded-3xl border border-cyan-100 bg-white p-8 shadow-[0_24px_70px_rgba(8,145,178,.12)]">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-600/20"><LeafIcon /></div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Owner access</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Breathe Easy dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Enter your admin passcode to view live operations.</p>
        <form onSubmit={signIn} className="mt-7">
          <label htmlFor="passcode" className="text-xs font-bold text-slate-700">Passcode</label>
          <input id="passcode" type="password" required autoFocus value={passcode} onChange={(e) => setPasscode(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Enter passcode" />
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-700/15 transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? "Opening dashboard…" : "View dashboard"}</button>
        </form>
      </div>
    </main>
  );

  const maxCalls = Math.max(...stats.callsByDay.map((day) => day.count), 1);
  const activityTotal = Math.max(stats.totalCalls + stats.chats + stats.bookings, 1);
  const callShare = stats.totalCalls / activityTotal * 100;
  const chatShare = stats.chats / activityTotal * 100;
  const pipelineValue = stats.bookings * 146;
  const selectedMissedCall = stats.missedCallLeads.find((lead) => lead.phone === selectedPhone) || stats.missedCallLeads[0];
  const statusStyle = { new: "bg-sky-100 text-sky-700", engaged: "bg-amber-100 text-amber-700", booked: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 text-slate-600" };

  return (
    <main className="min-h-screen bg-[#f1f7f8] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 lg:px-10">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white shadow-md shadow-cyan-800/15"><LeafIcon /></div>
            <div><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Breathe Easy <span className="font-normal text-slate-500">| Owner Dashboard</span></h1><p className="mt-0.5 text-xs text-slate-500">AI receptionist, chat, and lead pipeline at a glance</p></div>
          </div>
          <div className="flex items-center gap-2"><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><span className="mr-1.5 text-emerald-500">●</span>All systems live</span><span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{stats.period}</span></div>
        </header>

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Calls answered", stats.totalCalls, "Every call captured", "bg-cyan-500"],
            ["Bookings captured", stats.bookings, "Latest qualified leads", "bg-emerald-500"],
            ["Chats handled", stats.chats, `${stats.afterHoursCount} calls after hours`, "bg-violet-500"],
            ["Pipeline value", `$${pipelineValue.toLocaleString()}`, `${stats.bookings} bookings × $146 avg plan`, "bg-amber-500"],
          ].map(([label, value, note, accent]) => <div key={String(label)} className="relative overflow-hidden rounded-2xl border border-[#e2edef] bg-white p-5 shadow-sm"><span className={`absolute inset-x-0 top-0 h-1 ${accent}`} /><p className="text-[11px] font-bold uppercase tracking-[.09em] text-slate-500">{label}</p><p className="mt-1 text-4xl font-extrabold tracking-tight">{value}</p><p className="mt-1 text-xs font-semibold text-emerald-600">{note}</p></div>)}
        </section>

        <section className="mb-5 grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">
          <article className="rounded-2xl border border-[#e2edef] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Calls answered by day</h2><p className="mt-1 text-xs text-slate-400">Last 14 days</p></div><span className="text-xs font-semibold text-cyan-700">{stats.totalCalls} this month</span></div>
            <div className="mt-5 flex h-44 items-end gap-1.5 border-b border-slate-100 pb-0 sm:gap-2">
              {stats.callsByDay.map((day, index) => <div key={day.date} className="group relative flex h-full flex-1 items-end"><div title={`${day.count} calls`} style={{ height: `${Math.max(day.count / maxCalls * 100, 3)}%` }} className={`w-full rounded-t-md ${index === stats.callsByDay.length - 1 ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "bg-gradient-to-t from-cyan-700 to-cyan-400"}`}><span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-white group-hover:block">{day.count}</span></div></div>)}
            </div>
            <div className="mt-2 flex gap-1.5 sm:gap-2">{stats.callsByDay.map((day) => <span key={day.date} className="flex-1 text-center text-[9px] text-slate-400">{new Date(`${day.date}T12:00:00`).getDate()}</span>)}</div>
          </article>

          <article className="rounded-2xl border border-[#e2edef] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold">Activity mix</h2><p className="mt-1 text-xs text-slate-400">AI-handled customer activity</p>
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(#0891b2 0 ${callShare}%, #10b981 ${callShare}% ${callShare + chatShare}%, #6366f1 ${callShare + chatShare}% 100%)` }}><div className="absolute inset-6 flex items-center justify-center rounded-full bg-white text-center"><div><b className="text-xl">{stats.totalCalls + stats.chats}</b><p className="text-[9px] uppercase text-slate-400">contacts</p></div></div></div>
              <div className="space-y-3">{[["Calls", stats.totalCalls], ["Chats", stats.chats], ["Bookings", stats.bookings]].map(([label, value], i) => <div key={String(label)} className="flex items-center gap-2 text-xs text-slate-600"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i] }} /><span>{label}</span><b className="ml-auto text-slate-900">{value}</b></div>)}</div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2edef] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold">Top questions</h2>{stats.sampleData && <SampleTag />}</div><p className="mt-1 text-xs text-slate-400">What customers ask most</p>
            <div className="mt-3">{stats.topQuestions.map((question, i) => <div key={question.label} className="border-b border-slate-100 py-2.5 last:border-0"><div className="flex justify-between text-xs"><span className="font-medium text-slate-600">{question.label}</span><b className="text-cyan-700">{question.pct}%</b></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${question.pct}%`, background: colors[i] }} /></div></div>)}</div>
          </article>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-[#e2edef] bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-sm font-bold">Latest leads</h2><p className="mt-1 text-xs text-slate-400">The 20 newest opportunities from calls and chat</p></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">{stats.leads.length} leads</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-500"><th className="px-5 py-3">When</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">What they wanted</th><th className="px-5 py-3">Status</th></tr></thead>
            <tbody>{stats.leads.length ? stats.leads.map((lead) => <tr key={lead.id} className="border-b border-slate-100 last:border-0"><td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatWhen(lead.createdAt)}</td><td className="px-3 py-3 font-semibold">{lead.name}</td><td className="whitespace-nowrap px-3 py-3 text-slate-600">{phone(lead.phone)}</td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${lead.type === "Calls" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>{lead.type === "Calls" ? "CALL" : "CHAT"}</span></td><td className="max-w-md px-3 py-3 text-slate-600">“{excerpt(lead.transcript)}”</td><td className="px-5 py-3 font-bold text-amber-600">New</td></tr>) : <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">New leads will appear here as they arrive.</td></tr>}</tbody></table></div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-[#e2edef] bg-white shadow-sm">
          <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold">Missed Calls</h2><p className="mt-1 text-xs text-slate-400">SMS recovery conversations and human follow-up</p></div><span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{stats.missedCallLeads.length} conversations</span></div>
          <div className="grid border-t border-slate-100 xl:grid-cols-[1.25fr_1fr]">
            <div className="overflow-x-auto xl:border-r xl:border-slate-100">
              <table className="w-full min-w-[650px] text-left text-xs"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-500"><th className="px-5 py-3">Started</th><th className="px-3 py-3">Caller</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Last message</th><th className="px-5 py-3">Follow-up</th></tr></thead>
                <tbody>{stats.missedCallLeads.length ? stats.missedCallLeads.map((lead) => { const last = lead.messages.at(-1); return <tr key={lead.phone} onClick={() => { setSelectedPhone(lead.phone); setTextError(""); }} className={`cursor-pointer border-b border-slate-100 last:border-0 hover:bg-cyan-50/40 ${selectedMissedCall?.phone === lead.phone ? "bg-cyan-50/60" : ""}`}><td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatWhen(lead.startedAt)}</td><td className="px-3 py-3"><b className="block">{lead.caller || phone(lead.phone)}</b><span className="text-slate-500">{phone(lead.phone)}</span></td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle[lead.status]}`}>{lead.status}</span>{lead.doNotText && <span className="ml-1 text-[10px] font-bold text-rose-600">OPTED OUT</span>}</td><td className="max-w-xs px-3 py-3 text-slate-600">{last ? excerpt(last.body) : "Recovery started"}</td><td className="px-5 py-3">{lead.needsHuman ? <span className="font-bold text-rose-600">Needs human</span> : <span className="text-slate-400">AI active</span>}</td></tr>; }) : <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Missed-call recoveries will appear here.</td></tr>}</tbody>
              </table>
            </div>
            <div className="p-5">
              {selectedMissedCall ? <><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Conversation with {phone(selectedMissedCall.phone)}</h3><p className="mt-1 text-[11px] text-slate-400">Click another row to view its history</p></div></div>
                <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">{selectedMissedCall.messages.map((item) => <div key={item.id} className={`flex ${item.direction === "outbound" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 ${item.direction === "outbound" ? "bg-cyan-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><p className="whitespace-pre-wrap text-xs leading-5">{item.body}</p><p className={`mt-1 text-[9px] ${item.direction === "outbound" ? "text-cyan-100" : "text-slate-400"}`}>{item.author} · {formatWhen(item.createdAt)}{item.deliveryStatus ? ` · ${item.deliveryStatus}` : ""}</p></div></div>)}</div>
                <form onSubmit={textNow} className="mt-4"><label htmlFor="manual-text" className="text-xs font-bold text-slate-700">Text now</label><textarea id="manual-text" rows={3} maxLength={1000} disabled={selectedMissedCall.doNotText} value={manualText} onChange={(event) => setManualText(event.target.value)} placeholder={selectedMissedCall.doNotText ? "Caller has opted out" : "Write a personal follow-up…"} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100" />{textError && <p className="mt-1 text-xs text-rose-600">{textError}</p>}<button disabled={sendingText || selectedMissedCall.doNotText || !manualText.trim()} className="mt-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{sendingText ? "Sending…" : "Send text"}</button></form>
              </> : <div className="flex min-h-52 items-center justify-center text-xs text-slate-400">Select a conversation to see its message history.</div>}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Hours saved", `${stats.hoursSaved} hrs`, `${stats.totalCalls} calls × ~4 min avg`],
            ["After-hours coverage", stats.afterHoursCount, "calls outside Mon–Sat, 8–6"],
            ["Response time", "< 2 sec", "every call, every time"],
            ["Cost per lead", `$${stats.costPerLead.toFixed(2)}`, "estimated usage ÷ captured leads"],
          ].map(([label, value, note]) => <article key={String(label)} className="rounded-2xl bg-gradient-to-br from-cyan-950 to-emerald-900 p-5 text-white shadow-lg shadow-cyan-950/10"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-teal-200">{label}</p><p className="mt-1 text-3xl font-extrabold">{value}</p><p className="mt-1 text-[11px] text-teal-300">{note}</p></article>)}
        </section>

        <footer className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400 sm:flex-row sm:justify-between"><span>Live owner analytics · Refresh the page for current totals</span><span>AI operations: Atlantis AI Solutions</span></footer>
      </div>
    </main>
  );
}
