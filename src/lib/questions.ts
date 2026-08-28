import { promises as fs } from "fs";
import path from "path";

export type Question = { q: string; at: string };

const QUESTIONS_FILE = path.join(process.cwd(), "data", "questions.json");
let writeQueue = Promise.resolve();

export function saveQuestion(q: string): Promise<void> {
  const operation = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(QUESTIONS_FILE), { recursive: true });
    let questions: Question[] = [];
    try {
      const parsed = JSON.parse(await fs.readFile(QUESTIONS_FILE, "utf8"));
      questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch { /* create the file below */ }
    questions.push({ q, at: new Date().toISOString() });
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  });
  writeQueue = operation.catch(() => undefined);
  return operation;
}
