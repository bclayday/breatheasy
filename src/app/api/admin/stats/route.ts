import { promises as fs } from "fs";
import path from "path";
import { isAuthorized } from "@/lib/admin-auth";
import type { Lead } from "@/lib/leads";
import type { Question } from "@/lib/questions";

export const dynamic = "force-dynamic";

type TwilioCall = { start_time?: string; date_created?: string };
const sampleQuestions = [
  { label: "Pricing", pct: 38 }, { label: "Service area", pct: 21 },
  { label: "Filter sizing", pct: 17 }, { label: "Booking", pct: 14 }, { label: "Other", pct: 10 },
];

async function readJson(file: string, fallback: unknown) {
  try { return JSON.parse(await fs.readFile(path.join(process.cwd(), "data", file), "utf8")); }
  catch { return fallback; }
}

function easternParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "short", hour: "numeric", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function isAfterHours(date: Date) {
  const parts = easternParts(date);
  const hour = Number(parts.hour);
  return parts.weekday === "Sun" || hour < 8 || hour >= 18;
}

function dayKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function getCalls(): Promise<TwilioCall[]> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return [];
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Calls.json?To=%2B14704705493&PageSize=200`;
    const response = await fetch(url, { headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` }, cache: "no-store" });
    if (!response.ok) return [];
    const body = await response.json();
    return Array.isArray(body.calls) ? body.calls : [];
  } catch { return []; }
}

function classify(questions: Question[]) {
  const counts = new Map(sampleQuestions.map(({ label }) => [label, 0]));
  for (const { q } of questions) {
    const text = q.toLowerCase();
    const label = /price|cost/.test(text) ? "Pricing" : /area|serve|city|zip/.test(text) ? "Service area" : /size|measure/.test(text) ? "Filter sizing" : /book|schedule|appointment/.test(text) ? "Booking" : "Other";
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const total = questions.length;
  const result = [...counts].map(([label, count]) => ({ label, pct: Math.round(count / total * 100) }));
  const difference = 100 - result.reduce((sum, item) => sum + item.pct, 0);
  if (result.length) result[result.length - 1].pct += difference;
  return result;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const [calls, leadData, questionData] = await Promise.all([
    getCalls(), readJson("leads.json", { leads: [] }), readJson("questions.json", []),
  ]);
  const leads: Lead[] = (Array.isArray(leadData) ? leadData : leadData.leads || []).sort((a: Lead, b: Lead) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const questions: Question[] = Array.isArray(questionData) ? questionData : questionData.questions || [];
  const month = dayKey(now).slice(0, 7);
  const monthlyCalls = calls.filter((call) => {
    const value = call.start_time || call.date_created;
    return value && dayKey(new Date(value)).startsWith(month);
  });
  const last14 = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (13 - index));
    const dateKey = dayKey(date);
    return { date: dateKey, count: monthlyCalls.filter((call) => dayKey(new Date(call.start_time || call.date_created || 0)) === dateKey).length };
  });
  const monthlyLeads = leads.filter((lead) => dayKey(new Date(lead.createdAt)).startsWith(month));
  const bookings = monthlyLeads.length;
  const chats = monthlyLeads.filter((lead) => lead.type === "Chat").length;
  const estimatedSpend = monthlyCalls.length * 4 * 0.1;

  return Response.json({
    totalCalls: monthlyCalls.length,
    callsByDay: last14,
    bookings,
    chats,
    afterHoursCount: monthlyCalls.filter((call) => isAfterHours(new Date(call.start_time || call.date_created || 0))).length,
    topQuestions: questions.length ? classify(questions) : sampleQuestions,
    leads: leads.slice(0, 20),
    hoursSaved: Number((monthlyCalls.length * 4 / 60).toFixed(1)),
    costPerLead: Number((bookings ? estimatedSpend / bookings : estimatedSpend).toFixed(2)),
    period: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "America/New_York" }).format(now),
    sampleData: questions.length === 0,
  });
}
