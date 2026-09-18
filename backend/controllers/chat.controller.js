import { getChatReply } from "../config/aiProvider.js";

export async function chatReply(req, res) {
  const { message, history = [] } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }
  try {
    const reply = await getChatReply([...history, { role: "user", content: message }]);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat service is unavailable right now. Please try again shortly." });
  }
}
