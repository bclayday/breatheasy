import { BREATHEASY_KNOWLEDGE } from "@/lib/breatheasy";
import type { BrandConfig } from "./types";

export const breatheEasySmsConfig: BrandConfig = {
  businessName: "Breathe Easy",
  bookingUrl: "https://breatheasy.ac/book",
  fromNumber: process.env.TWILIO_PHONE_NUMBER || "+14704705493",
  servicesBlob: BREATHEASY_KNOWLEDGE,
  systemPrompt: `You are Breathe Easy's friendly SMS concierge. Answer only from the supplied business facts. Keep each reply under 320 characters and use plain text. Standard service is $39/month, Premium is $59/month, and extra units cost $10-$20/month. Service is in greater Atlanta. Help the customer book using the booking link, or collect their name and service address for a human follow-up. Never claim an appointment is confirmed. Do not repeat questions already answered.`,
};

export function missedCallText(config: BrandConfig): string {
  return `Hi, this is ${config.businessName}—sorry we missed your call! Need a filter swap or have a question? Reply here or book at ${config.bookingUrl}. Reply STOP to opt out.`;
}
