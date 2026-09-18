import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { MissedCallLead, RecoveryStore } from "./types";

type StoreData = { leads: MissedCallLead[] };

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : digits ? `+${digits}` : value.trim();
}

export class JsonRecoveryStore implements RecoveryStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly file = path.join(process.cwd(), "data", "missed-call-leads.json")) {}

  private async read(): Promise<StoreData> {
    try {
      const data = JSON.parse(await fs.readFile(this.file, "utf8"));
      return { leads: Array.isArray(data) ? data : Array.isArray(data.leads) ? data.leads : [] };
    } catch {
      return { leads: [] };
    }
  }

  async list() {
    const data = await this.read();
    return data.leads.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  }

  async get(phone: string) {
    const normalized = normalizePhone(phone);
    return (await this.read()).leads.find((lead) => normalizePhone(lead.phone) === normalized);
  }

  async update(phone: string, mutate: (lead: MissedCallLead | undefined) => MissedCallLead): Promise<MissedCallLead> {
    const normalized = normalizePhone(phone);
    const operation = this.queue.then(async () => {
      const data = await this.read();
      const index = data.leads.findIndex((lead) => normalizePhone(lead.phone) === normalized);
      const updated = mutate(index >= 0 ? structuredClone(data.leads[index]) : undefined);
      updated.phone = normalized;
      if (index >= 0) data.leads[index] = updated; else data.leads.push(updated);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(data, null, 2));
      return updated;
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  async updateDelivery(sid: string, status: string): Promise<void> {
    const operation = this.queue.then(async () => {
      const data = await this.read();
      let changed = false;
      for (const lead of data.leads) {
        const message = lead.messages.find((item) => item.twilioSid === sid);
        if (message) { message.deliveryStatus = status; changed = true; }
      }
      if (changed) await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    });
    this.queue = operation.catch(() => undefined);
    await operation;
  }
}

export const recoveryStore = new JsonRecoveryStore();
export { normalizePhone };
