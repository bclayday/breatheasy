import { askOpenAI, fallbackAnswer, type ChatMessage } from "@/lib/breatheasy";
import { saveLead } from "@/lib/leads";

export const dynamic = "force-dynamic";

function contactFrom(messages: ChatMessage[]) {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const all = userMessages.join("\n");
  const phone = all.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0];
  const explicit = all.match(/(?:my name is|i am|i'm)\s+([a-z][a-z' -]{1,60}?)(?=\s+(?:and\s+)?(?:my\s+)?phone|[,.;\n]|$)/i)?.[1];
  const namePromptIndex = messages.findLastIndex((m) => m.role === "assistant" && /(?:full )?name/i.test(m.content));
  const afterPrompt = namePromptIndex >= 0 ? messages.slice(namePromptIndex + 1).find((m) => m.role === "user")?.content : undefined;
  const beforePhone = afterPrompt && phone ? afterPrompt.slice(0, afterPrompt.indexOf(phone)) : afterPrompt;
  const promptedName = beforePhone?.replace(/(?:and\s+)?(?:my\s+)?phone(?: number)?(?: is)?$/i, "").replace(/[,.;]+$/, "").trim();
  const name = (explicit || promptedName)?.trim();
  return { name, phone };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages.filter((m: ChatMessage) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string").slice(-20)
      : [];
    if (!messages.length) return Response.json({ error: "Messages are required" }, { status: 400 });
    const last = messages.at(-1)?.content || "";
    let answer = await askOpenAI(messages);
    if (!answer) answer = fallbackAnswer(last);
    const { name, phone } = contactFrom(messages);
    const alreadySaved = messages.some((m) => m.role === "assistant" && /team will confirm/i.test(m.content));
    if (name && phone && !alreadySaved) {
      await saveLead({ type: "Chat", name, phone, transcript: messages.map((m) => `${m.role}: ${m.content}`).join("\n") });
      if (!/team will confirm/i.test(answer)) answer += " Our team will confirm your service details and schedule.";
    }
    return Response.json({ message: answer });
  } catch {
    return Response.json({ message: fallbackAnswer("") });
  }
}
