export const xml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

export function twiml(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export function gather(prompt: string, action: string): string {
  return `<Gather input="speech" action="${xml(action)}" method="POST" speechTimeout="auto"><Say>${xml(prompt)}</Say></Gather><Say>${xml(prompt)}</Say><Redirect method="POST">${xml(action)}</Redirect>`;
}
