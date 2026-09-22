import pool from "../config/db.js";
import { getChatReply } from "../config/aiProvider.js";

const TUTORIAL_TAG = /\[\[TUTORIAL:([a-z0-9-]+)\]\]/i;

// POST /api/chat
// Body: { message: string, history?: [{ role: 'user'|'assistant', content: string }] }
// `history` is the conversation so far, sent by the client each time
// (kept in React state on the frontend — no database table needed
// unless you later want chat transcripts saved long-term).
export async function chatReply(req, res) {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    // The model needs to know what tutorials actually exist so it can
    // reference a real one instead of guessing — fetched fresh each
    // request since tutorials can be published at any time.
    const [tutorials] = await pool.query(
      `SELECT t.slug, t.title, t.title_hindi AS titleHindi, p.name AS productName, p.slug AS productSlug
       FROM tutorials t
       JOIN products p ON p.id = t.product_id`
    );

    const rawReply = await getChatReply([...history, { role: "user", content: message }], tutorials);

    // Pull the sentinel tag (if present) out of the reply text and turn
    // it into structured data the frontend can render as a clickable
    // "open this tutorial" card, without showing the raw tag to the user.
    const tagMatch = rawReply.match(TUTORIAL_TAG);
    let reply = rawReply;
    let tutorialSuggestion = null;

    if (tagMatch) {
      const slug = tagMatch[1];
      const found = tutorials.find((t) => t.slug === slug);
      if (found) {
        tutorialSuggestion = {
          productSlug: found.productSlug,
          tutorialSlug: found.slug,
          title: found.title,
          titleHindi: found.titleHindi,
        };
      }
      // Strip the tag whether or not it matched a real tutorial — a
      // hallucinated slug should never leak into what the customer sees.
      reply = rawReply.replace(tagMatch[0], "").trim();
    }

    res.json({ reply, tutorialSuggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat service is unavailable right now. Please try again shortly." });
  }
}
