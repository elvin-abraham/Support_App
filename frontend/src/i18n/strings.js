// UI chrome strings for the customer-facing app only. The admin panel's
// own labels stay in English (an internal tool for staff); this covers
// what customers actually see.
//
// Important distinction: translate common words with real Hindi
// equivalents (Guide, Product, Back, Library) — don't just spell the
// English word out phonetically in Devanagari script. Proper nouns and
// brand names (like "Incluziv ERP") are the one place transliteration
// is actually correct, since names don't get translated.
export const strings = {
  en: {
    appTitle: "Guide",
    appSubtitle: "Tell us what you're stuck on and we'll walk you through it, step by step.",
    manageTutorials: "Manage tutorials",
    selectorLead: "Pick your product, then the task you need help with.",
    product: "Product",
    selectProduct: "Select a product…",
    question: "Question",
    selectQuestion: "Select a question…",
    noBackend: "We can't reach the tutorial library right now. Start the backend (npm run dev in backend/), or preview a sample walkthrough below in the meantime.",
    previewSample: "Preview a sample tutorial",
    searchPlaceholder: "Type your question, e.g. How to login?",
    searchButton: "Search",
    searching: "Looking for the right tutorial…",
    noMatch: "We couldn't find a matching tutorial for that. Try rephrasing your question.",
    chatPlaceholder: "Type your message…",
    send: "Send",
    thinking: "Thinking…",
    newSearch: "New search",
    openTutorial: "Open this tutorial",
    exit: "Exit",
    back: "Back",
    next: "Next",
    done: "Done",
    stepOf: (i, total) => `Step ${i} of ${total}`,
  },
  hi: {
    appTitle: "मार्गदर्शिका",
    appSubtitle: "बताइए आपको कहाँ दिक्कत आ रही है, हम आपको चरण दर चरण मदद करेंगे।",
    manageTutorials: "मार्गदर्शिकाएँ प्रबंधित करें",
    selectorLead: "पहले अपना उत्पाद चुनें, फिर वह काम जिसमें आपको मदद चाहिए।",
    product: "उत्पाद",
    selectProduct: "उत्पाद चुनें…",
    question: "प्रश्न",
    selectQuestion: "प्रश्न चुनें…",
    noBackend: "अभी हम मार्गदर्शिका सूची तक नहीं पहुँच पा रहे। बैकएंड शुरू करें (backend/ में npm run dev), या इस बीच नीचे एक नमूना मार्गदर्शिका देखें।",
    previewSample: "नमूना मार्गदर्शिका देखें",
    searchPlaceholder: "अपना प्रश्न लिखें, जैसे लॉगिन कैसे करें?",
    searchButton: "खोजें",
    searching: "सही मार्गदर्शिका खोजी जा रही है…",
    noMatch: "इसके लिए कोई मिलती-जुलती मार्गदर्शिका नहीं मिली। कृपया अपना प्रश्न अलग तरीके से लिखें।",
    chatPlaceholder: "अपना संदेश लिखें…",
    send: "भेजें",
    thinking: "सोचा जा रहा है…",
    newSearch: "नई खोज",
    openTutorial: "यह मार्गदर्शिका खोलें",
    exit: "बाहर निकलें",
    back: "वापस",
    next: "आगे",
    done: "हो गया",
    stepOf: (i, total) => `चरण ${i} / ${total}`,
  },
};

export function t(key, lang, ...args) {
  const dict = strings[lang] || strings.hi;
  const value = dict[key] ?? strings.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

// Picks the right-language version of admin-entered content, falling
// back to English if the Hindi field was left empty (so older tutorials
// or partially-translated ones never show a blank box).
export function pickText(englishText, hindiText, lang) {
  if (lang === "hi" && hindiText && hindiText.trim()) return hindiText;
  return englishText || hindiText || "";
}
