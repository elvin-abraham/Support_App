import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "knowledge", "incluziv-kb.txt");
const knowledgeBase = fs.readFileSync(KB_PATH, "utf-8");

const CHAT_SYSTEM_PROMPT = `You are a helpful, friendly support assistant for Incluziv ERP, Incluziv Cloud, and Incluziv Retail — software for home furnishings and textile distribution businesses.

Answer customer questions using ONLY the knowledge base provided below. Match the clear, conversational, non-robotic tone used in the example conversations.

Hard rules:
- If the knowledge base does not contain an answer to the question, say so honestly (e.g. "I don't have that on file — let me get you to a human who can help") rather than guessing or inventing steps, policies, or menu paths that aren't in the knowledge base.
- Never make up specific menu names, button labels, or click sequences that aren't explicitly stated in the knowledge base.
- Keep answers concise and conversational, the way the "AI Agent" responses in the knowledge base are written — not a formal document dump.

--- KNOWLEDGE BASE START ---
${knowledgeBase}
--- KNOWLEDGE BASE END ---`;

const PROVIDER = process.env.AI_PROVIDER || "gemini";

// Low-level call: takes a system prompt and a conversation, returns the
// model's reply text. Both the chatbot and tutorial-matching features
// call this — only the system prompt differs, so provider-specific
// request/response handling lives in exactly one place.
async function callModel(systemPrompt, messages) {
  if (PROVIDER === "gemini") return callGemini(systemPrompt, messages);
  if (PROVIDER === "anthropic") return callAnthropic(systemPrompt, messages);
  throw new Error(`Unknown AI_PROVIDER "${PROVIDER}" — set it to "gemini" or "anthropic" in .env`);
}

async function callGemini(systemPrompt, messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env — get a free key at aistudio.google.com");
  }
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
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error("Gemini returned no usable reply — check the response shape hasn't changed.");
  }
  return reply;
}

async function callAnthropic(systemPrompt, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in .env");
  }
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const textBlock = data?.content?.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Claude returned no usable text reply.");
  }
  return textBlock.text;
}

// --- Chatbot: full knowledge-base-backed conversational answers ---
export async function getChatReply(messages) {
  return callModel(CHAT_SYSTEM_PROMPT, messages);
}

// --- Tutorial matching: does NOT touch the knowledge base at all —
// this only needs the list of tutorial titles you actually have, so it
// stays small and cheap regardless of how big the KB grows. ---
export async function matchTutorial(query, tutorials) {
  const list = tutorials
    .map((t, i) => `${i + 1}. [${t.slug}] "${t.title}" (Hindi: "${t.titleHindi || "—"}") — Product: ${t.productName}`)
    .join("\n");

  const systemPrompt = `You match a customer's free-text question (in English, Hindi, Hinglish, or with typos/grammar mistakes) to the single closest tutorial from this list. If nothing genuinely matches the customer's intent, respond with exactly the word NONE.

Tutorials:
${list}

Respond with ONLY the bracketed slug of the best match (e.g. "how-to-login"), or the word NONE. No other text.`;

  const reply = await callModel(systemPrompt, [{ role: "user", content: query }]);
  const cleaned = reply.trim().replace(/^\[|\]$/g, "");
  return cleaned.toUpperCase() === "NONE" ? null : cleaned;
}
