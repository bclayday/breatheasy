import { promises as fs } from "fs";
import path from "path";
import { isAuthorized } from "@/lib/admin-auth";

export type OpsCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  plan: "standard" | "premium";
  units: number;
  filterSizes: string;
  cadenceDays: number;
  status: "active" | "paused" | "offboarded";
  lastSwap: string | null;
  notes: string;
  source: string;
  createdAt: string;
};

type OpsData = { customers: OpsCustomer[] };

const OPS_FILE = path.join(process.cwd(), "data", "ops.json");
const LEADS_FILE = path.join(process.cwd(), "data", "customers.json");

const memory = new Map<string, OpsData>();

async function readOps(): Promise<OpsData> {
  try {
    if (memory.has(OPS_FILE)) return memory.get(OPS_FILE)!;
    const raw = await fs.readFile(OPS_FILE, "utf-8");
    const data = JSON.parse(raw) as OpsData;
    memory.set(OPS_FILE, data);
    return data;
  } catch {
    return { customers: [] };
  }
}

async function writeOps(data: OpsData): Promise<void> {
  memory.set(OPS_FILE, data);
  try {
    await fs.writeFile(OPS_FILE, JSON.stringify(data, null, 2));
  } catch {
    /* read-only FS (serverless): keep in-memory copy */
  }
}

async function readFormLeads() {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data.customers) ? data.customers : [];
  } catch {
    return [];
  }
}

function nextSwapFor(c: OpsCustomer): string | null {
  if (!c.lastSwap) return null;
  return new Date(new Date(c.lastSwap).getTime() + c.cadenceDays * 86400000).toISOString();
}

function newId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCustomer(input: Record<string, unknown>): OpsCustomer {
  const plan = input.plan === "premium" ? "premium" : "standard";
  const cadenceDays = Number(input.cadenceDays) > 0 ? Number(input.cadenceDays) : plan === "premium" ? 30 : 90;
  return {
    id: String(input.id || newId()),
    name: String(input.name || "").trim(),
    phone: String(input.phone || "").trim(),
    email: String(input.email || "").trim(),
    street: String(input.street || "").trim(),
    city: String(input.city || "").trim(),
    state: String(input.state || "GA").trim(),
    zip: String(input.zip || "").trim(),
    plan,
    units: Number(input.units) > 0 ? Number(input.units) : 1,
    filterSizes: String(input.filterSizes || "Measure at first visit").trim(),
    cadenceDays,
    status: (["active", "paused", "offboarded"] as const).includes(input.status as OpsCustomer["status"])
      ? (input.status as OpsCustomer["status"])
      : "active",
    lastSwap: input.lastSwap ? String(input.lastSwap) : null,
    notes: String(input.notes || "").trim(),
    source: String(input.source || "manual"),
    createdAt: String(input.createdAt || new Date().toISOString()),
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [ops, leads] = await Promise.all([readOps(), readFormLeads()]);
  const customers = ops.customers.map((c) => ({ ...c, nextSwap: nextSwapFor(c) }));
  const now = Date.now();
  const enriched = customers.map((c) => {
    const next = c.nextSwap ? new Date(c.nextSwap).getTime() : null;
    return {
      ...c,
      overdue: c.status === "active" && next !== null && next < now,
      dueSoon:
        c.status === "active" &&
        next !== null &&
        next >= now &&
        next - now < 14 * 86400000,
    };
  });
  const convertedEmails = new Set(ops.customers.map((c) => c.email.toLowerCase()).filter(Boolean));
  const newLeads = leads.filter((l: { email?: string; convertedAt?: string }) => !l.convertedAt);
  return Response.json({
    customers: enriched,
    formLeads: newLeads,
    summary: {
      active: enriched.filter((c) => c.status === "active").length,
      paused: enriched.filter((c) => c.status === "paused").length,
      dueSoon: enriched.filter((c) => c.dueSoon).length,
      overdue: enriched.filter((c) => c.overdue).length,
      monthlyRevenue: enriched
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + (c.plan === "premium" ? 59 : 39) + (c.units > 2 ? Math.min((c.units - 2) * 5, 20) : 0), 0),
      leads: newLeads.length,
    },
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { action?: string; id?: string; customer?: Record<string, unknown>; patch?: Record<string, unknown>; markConvertedEmail?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const ops = await readOps();

  switch (body.action) {
    case "add": {
      const customer = normalizeCustomer(body.customer || {});
      if (!customer.name) return Response.json({ error: "Name is required" }, { status: 400 });
      ops.customers.push(customer);
      await writeOps(ops);
      return Response.json({ ok: true, customer });
    }
    case "convert": {
      const customer = normalizeCustomer(body.customer || { source: "form" });
      if (!customer.name) return Response.json({ error: "Name is required" }, { status: 400 });
      ops.customers.push(customer);
      await writeOps(ops);
      // mark the form lead converted so it stops appearing
      try {
        const raw = await fs.readFile(LEADS_FILE, "utf-8");
        const data = JSON.parse(raw);
        const target = (data.customers || []).find(
          (l: { email?: string; id?: string }) =>
            (body.markConvertedEmail && l.email && l.email.toLowerCase() === body.markConvertedEmail.toLowerCase()) ||
            (body.id && l.id === body.id)
        );
        if (target) {
          target.convertedAt = new Date().toISOString();
          await fs.writeFile(LEADS_FILE, JSON.stringify(data, null, 2));
        }
      } catch { /* best effort */ }
      return Response.json({ ok: true, customer });
    }
    case "update": {
      const idx = ops.customers.findIndex((c) => c.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      ops.customers[idx] = normalizeCustomer({ ...ops.customers[idx], ...body.patch, id: ops.customers[idx].id });
      await writeOps(ops);
      return Response.json({ ok: true, customer: ops.customers[idx] });
    }
    case "swap-done": {
      const idx = ops.customers.findIndex((c) => c.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      ops.customers[idx].lastSwap = new Date().toISOString();
      await writeOps(ops);
      return Response.json({ ok: true, customer: ops.customers[idx] });
    }
    case "status": {
      const idx = ops.customers.findIndex((c) => c.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const patch = body.patch || {};
      ops.customers[idx].status = (["active", "paused", "offboarded"] as const).includes(patch.status as OpsCustomer["status"])
        ? (patch.status as OpsCustomer["status"])
        : ops.customers[idx].status;
      await writeOps(ops);
      return Response.json({ ok: true, customer: ops.customers[idx] });
    }
    case "delete": {
      ops.customers = ops.customers.filter((c) => c.id !== body.id);
      await writeOps(ops);
      return Response.json({ ok: true });
    }
    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
