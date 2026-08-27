export const BREATHEASY_KNOWLEDGE = `
Breathe Easy serves the Greater Atlanta metro area, including Atlanta, Alpharetta, Marietta, Decatur, Sandy Springs, Roswell, Johns Creek, Dunwoody, Kennesaw, and surrounding communities. Hours are Monday through Saturday, 8am to 6pm.

Services:
- Air Filter Delivery & Installation: premium MERV 8-16 filters delivered and professionally installed monthly, every two months, or quarterly. Standard filters are MERV 11. Multiple HVAC units are supported.
- HVAC Maintenance & Tune-Ups: comprehensive inspection, coil cleaning and maintenance, refrigerant level check, and thermostat calibration.

Pricing:
- Standard: $39/month. Filter delivery and professional installation every 3 months, premium MERV-rated filters, background-checked technicians, free sizing consultation, reminders, and cancel/pause anytime.
- Premium: $59/month. Everything in Standard, plus monthly installation, annual HVAC inspection, same-week priority scheduling, 10% off add-ons, and a satisfaction guarantee.
- Both plans include up to 2 HVAC units. 3 units add $10/month; 4 add $15/month; 5 add $20/month; 6 or more require a quote. No contracts or hidden fees.

How it works: the customer picks a plan, filter size, and schedule; a background-checked technician delivers and installs the filters; Breathe Easy sends reminders and handles future visits automatically. If the customer does not know the filter size, a technician measures it free during the first visit. Most installations take 5-15 minutes per unit. Filters are generally changed every 1-3 months. The phone number shown on the site is (470) 470-5493.
`.trim();

export const CSR_PROMPT = `You are the friendly, concise customer service representative for Breathe Easy. Use only the business facts below. Never invent availability or claim an appointment is booked. If someone wants to book, collect their full name and phone number, one at a time if needed, then say the team will confirm their service details and schedule. Keep answers brief and natural.

${BREATHEASY_KNOWLEDGE}`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function fallbackAnswer(input: string): string {
  const text = input.toLowerCase();
  if (/\b(price|pricing|cost|plan|month)\b/.test(text)) return "Standard is $39/month and Premium is $59/month. Both include up to 2 HVAC units; additional-unit pricing starts at $10/month.";
  if (/\b(hour|open|close|weekend|saturday)\b/.test(text)) return "We’re available Monday through Saturday, 8am to 6pm.";
  if (/\b(area|serve|location|city|atlanta|zip)\b/.test(text)) return "We serve Greater Atlanta, including Atlanta, Alpharetta, Marietta, Decatur, Sandy Springs, Roswell, Johns Creek, Dunwoody, Kennesaw, and nearby communities.";
  if (/\b(size|measure|measurement)\b/.test(text)) return "Your current filter size is usually printed on its side. If you’re not sure, we’ll measure it free during your first visit.";
  if (/\b(how|work|process|visit|install)\b/.test(text)) return "Pick a plan, filter size, and schedule. A background-checked technician delivers and installs fresh filters, and we remind you before future visits.";
  if (/\b(book|schedule|appointment|sign up|start)\b/.test(text)) return "I’d be happy to help. What’s your full name and best phone number? Our team will confirm the service details and schedule.";
  return "I can help with Breathe Easy services, pricing, service areas, filter sizing, hours, or getting started. What would you like to know?";
}

export function isBookingIntent(input: string): boolean {
  return /\b(book|schedule|appointment|sign up|subscribe|get started|start service|come out)\b/i.test(input);
}

export function isExitIntent(input: string): boolean {
  return /\b(goodbye|bye|that'?s all|nothing else|no thanks|no thank you)\b/i.test(input);
}

export async function askOpenAI(messages: ChatMessage[], phone = false): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: `${CSR_PROMPT}${phone ? " Answer for a phone call in at most 2 short sentences, with no formatting." : ""}` }, ...messages],
        temperature: 0.3,
        max_tokens: phone ? 120 : 250,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
