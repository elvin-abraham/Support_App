const BASE_URL = "/api";

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
export async function fetchTutorialsForProduct(productSlug) {
  const res = await fetch(`${BASE_URL}/products/${productSlug}/tutorials`);
  if (!res.ok) throw new Error("Failed to fetch tutorials");
  return res.json();
}
export async function fetchTutorial(productSlug, tutorialSlug) {
  const res = await fetch(`${BASE_URL}/products/${productSlug}/tutorials/${tutorialSlug}`);
  if (!res.ok) throw new Error("Failed to fetch tutorial");
  return res.json();
}

// Full flat list across all products — used to power live, local search
// suggestions as the customer types.
export async function fetchAllTutorials() {
  const res = await fetch(`${BASE_URL}/tutorials`);
  if (!res.ok) throw new Error("Failed to fetch tutorials");
  return res.json();
}

// AI-based fallback when the customer's typed question doesn't obviously
// match any tutorial title (different phrasing, another language, typos).
export async function matchTutorialQuery(query) {
  const res = await fetch(`${BASE_URL}/tutorials/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Search is unavailable right now");
  return res.json(); // { matched: boolean, productSlug?, tutorialSlug? }
}

// Sends a message to the chatbot, along with the conversation so far.
// Returns { reply, tutorialSuggestion? } — tutorialSuggestion is present
// when the AI's answer relates to a specific existing tutorial.
export async function sendChatMessage(message, history) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Chat is unavailable right now");
  }
  return res.json();
}
