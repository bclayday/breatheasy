export type LeadStatus = "new" | "engaged" | "booked" | "closed";

export type RecoveryMessage = {
  id: string;
  direction: "inbound" | "outbound";
  author: "caller" | "ai" | "agent" | "system";
  body: string;
  createdAt: string;
  twilioSid?: string;
  deliveryStatus?: string;
};

export type MissedCallLead = {
  caller: string;
  phone: string;
  startedAt: string;
  messages: RecoveryMessage[];
  status: LeadStatus;
  lastAiReply: string | null;
  doNotText?: boolean;
  needsHuman?: boolean;
  lastRecoverySentAt?: string;
};

export type BrandConfig = {
  businessName: string;
  bookingUrl: string;
  servicesBlob: string;
  systemPrompt: string;
  fromNumber: string;
};

export type SmsSendResult = { sid: string; status?: string };
export type SmsSender = (to: string, body: string, fromNumber?: string) => Promise<SmsSendResult>;
export type AiReplyGenerator = (lead: MissedCallLead, config: BrandConfig) => Promise<string | null>;

export interface RecoveryStore {
  list(): Promise<MissedCallLead[]>;
  get(phone: string): Promise<MissedCallLead | undefined>;
  update(phone: string, mutate: (lead: MissedCallLead | undefined) => MissedCallLead): Promise<MissedCallLead>;
  updateDelivery(sid: string, status: string): Promise<void>;
}
