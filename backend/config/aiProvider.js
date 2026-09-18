import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "knowledge", "incluziv-kb.txt");
const knowledgeBase = fs.readFileSync(KB_PATH, "utf-8");

const SYSTEM_PROMPT = `You are a helpful support assistant. Use only this KB:\n${knowledgeBase}`;

const PROVIDER = process.env.AI_PROVIDER || "gemini";

export async function getChatReply(messages) {
  if (PROVIDER === "gemini") return getGeminiReply(messages);
  if (PROVIDER === "anthropic") return getAnthropicReply(messages);
  throw new Error(`Unknown AI_PROVIDER "${PROVIDER}"`);
}

async function getGeminiReply(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error (${res.status})`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function getAnthropicReply(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in .env");
  return "placeholder";
}
