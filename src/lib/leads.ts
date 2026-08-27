import { promises as fs } from "fs";
import path from "path";

export type Lead = {
  id: string;
  type: "Chat" | "Calls";
  name: string;
  phone: string;
  createdAt: string;
  transcript?: string;
};

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");
let writeQueue = Promise.resolve();

export function postLead(type: string, row: unknown[]): void {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab: type, row }),
  }).catch(() => undefined);
}

export async function saveLead(lead: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  const saved: Lead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  const operation = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
    let data: { leads: Lead[] } = { leads: [] };
    try { data = JSON.parse(await fs.readFile(LEADS_FILE, "utf8")); } catch { /* create below */ }
    data.leads.push(saved);
    await fs.writeFile(LEADS_FILE, JSON.stringify(data, null, 2));
  });
  writeQueue = operation.catch(() => undefined);
  await operation;
  postLead(lead.type, [saved.createdAt, saved.name, saved.phone, saved.transcript || ""]);
  return saved;
}
