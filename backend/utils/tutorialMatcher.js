/**
 * Local tutorial search.
 *
 * This matcher deliberately does NOT contain tutorial-specific words,
 * English/Hindi stop-word lists, or hard-coded questions.
 *
 * Each tutorial is searchable by:
 *   - English title
 *   - Hindi title
 *   - Related questions entered in the Admin Panel
 *
 * The related questions are the semantic bridge between different ways a
 * customer might ask the same thing. The matcher then handles normal
 * differences such as punctuation, word order, spacing, and small typos.
 */

function normalizeText(text = "") {
  return String(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(" ") : [];
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  let previous = Array.from({ length: a.length + 1 }, (_, i) => i);

  for (let j = 1; j <= b.length; j++) {
    const current = [j];

    for (let i = 1; i <= a.length; i++) {
      const insertCost = current[i - 1] + 1;
      const deleteCost = previous[i] + 1;
      const replaceCost = previous[i - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[i] = Math.min(insertCost, deleteCost, replaceCost);
    }

    previous = current;
  }

  return previous[a.length];
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function tokenSimilarity(a, b) {
  if (a === b) return 1;

  // Avoid treating extremely short words as a fuzzy match. For example,
  // one-character differences should not make unrelated short tokens match.
  if (a.length < 3 || b.length < 3) return 0;

  return stringSimilarity(a, b) >= 0.72 ? stringSimilarity(a, b) : 0;
}

function tokenCoverage(queryTokens, candidateTokens) {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  let matched = 0;
  let totalSimilarity = 0;

  for (const queryToken of queryTokens) {
    let best = 0;

    for (const candidateToken of candidateTokens) {
      best = Math.max(best, tokenSimilarity(queryToken, candidateToken));
      if (best === 1) break;
    }

    if (best > 0) {
      matched += 1;
      totalSimilarity += best;
    }
  }

  return (matched / queryTokens.length) * (totalSimilarity / queryTokens.length);
}

function tokenJaccard(queryTokens, candidateTokens) {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const used = new Set();
  let matchedCount = 0;
  let matchedSimilarity = 0;

  for (const queryToken of queryTokens) {
    let bestIndex = -1;
    let bestScore = 0;

    candidateTokens.forEach((candidateToken, index) => {
      if (used.has(index)) return;
      const score = tokenSimilarity(queryToken, candidateToken);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0 && bestScore >= 0.72) {
      used.add(bestIndex);
      matchedCount += 1;
      matchedSimilarity += bestScore;
    }
  }

  const unionSize = queryTokens.length + candidateTokens.length - matchedCount;
  return unionSize > 0 ? matchedSimilarity / unionSize : 0;
}

function phraseScore(query, candidate) {
  const q = normalizeText(query);
  const c = normalizeText(candidate);

  if (!q || !c) return 0;
  if (q === c) return 1;

  const editScore = stringSimilarity(q, c);
  const qTokens = tokenize(q);
  const cTokens = tokenize(c);

  const coverage = tokenCoverage(qTokens, cTokens);
  const jaccard = tokenJaccard(qTokens, cTokens);

  let containment = 0;
  if (q.length >= 4 && c.includes(q)) containment = Math.min(0.95, 0.82 + q.length / 200);
  if (c.length >= 4 && q.includes(c)) containment = Math.min(0.92, 0.78 + c.length / 200);

  return Math.max(
    editScore * 0.45 + coverage * 0.35 + jaccard * 0.20,
    containment
  );
}

function parseRelatedQuestions(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function candidatePhrases(tutorial) {
  const relatedQuestions = parseRelatedQuestions(tutorial.relatedQuestions);

  return [
    ...relatedQuestions,
    tutorial.title,
    tutorial.titleHindi,
  ].filter(Boolean);
}

/**
 * Returns the best tutorial object or null.
 *
 * A related-question match gets a small preference over a title-only match.
 * This is useful because the Admin Panel can explicitly describe the ways
 * customers naturally ask for a tutorial.
 */
export function findBestTutorial(query, tutorials, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || !Array.isArray(tutorials) || tutorials.length === 0) {
    return null;
  }

  const threshold = options.threshold ?? 0.56;

  let bestTutorial = null;
  let bestScore = 0;

  for (const tutorial of tutorials) {
    const relatedQuestions = parseRelatedQuestions(tutorial.relatedQuestions);
    const titlePhrases = [tutorial.title, tutorial.titleHindi].filter(Boolean);

    let tutorialBestScore = 0;

    for (const phrase of relatedQuestions) {
      tutorialBestScore = Math.max(tutorialBestScore, phraseScore(normalizedQuery, phrase) + 0.03);
    }

    for (const phrase of titlePhrases) {
      tutorialBestScore = Math.max(tutorialBestScore, phraseScore(normalizedQuery, phrase));
    }

    if (tutorialBestScore > bestScore) {
      bestScore = tutorialBestScore;
      bestTutorial = tutorial;
    }
  }

  return bestScore >= threshold ? bestTutorial : null;
}
