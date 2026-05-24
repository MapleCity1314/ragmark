const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "out", "off", "over",
  "under", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "and", "but", "or", "if", "while",
  "about", "up", "down", "just", "now", "it", "its", "that", "this",
  "these", "those", "which", "who", "whom", "what", "use", "using",
  "make", "made", "get", "one", "two", "first", "also", "new", "like",
  "still", "many", "much", "well", "way", "see", "need", "know",
]);

export function extractAutoTags(
  title: string,
  description: string,
  text: string,
  maxTags: number = 5,
): string[] {
  const combined = [title, description, text.slice(0, 3000)].join(" ");

  const words = combined
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);

  const phrases = extractPhrases(sorted, combined.toLowerCase());

  const scored = new Map<string, number>();
  for (const [word, count] of sorted) {
    scored.set(word, count);
  }
  for (const phrase of phrases) {
    scored.set(phrase, (scored.get(phrase) || 0) + 3);
  }

  const tagList = [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([w]) => w);

  return tagList;
}

function extractPhrases(
  freqPairs: [string, number][],
  text: string,
): string[] {
  const top = new Set(
    freqPairs.slice(0, 20).map(([w]) => w),
  );

  const words = text.split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i]?.replace(/[^a-z0-9]/g, "") ?? "";
    const w2 = words[i + 1]?.replace(/[^a-z0-9]/g, "") ?? "";
    if (top.has(w1) && top.has(w2) && w1 !== w2) {
      const phrase = `${w1} ${w2}`;
      if (!phrases.includes(phrase)) phrases.push(phrase);
    }
  }

  return phrases.slice(0, 5);
}
