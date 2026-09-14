export type Quote = {
  line: string;
  translation?: string;
  attribution: string;
  kind: "shloka" | "prose";
};

export const quotes: Quote[] = [
  {
    line: "शिवः शक्त्या युक्तो यदि भवति शक्तः प्रभवितुम्।",
    translation: "Only when joined with Shakti does the divine become capable of creation.",
    attribution: "Saundarya Lahari",
    kind: "shloka",
  },
  {
    line: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥",
    translation:
      "To the Devi who abides in all beings as power \u2014 salutations, salutations, salutations.",
    attribution: "Devi Mahatmyam",
    kind: "shloka",
  },
  {
    line: "सहनाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै।",
    translation:
      "May we be protected together. May we be nourished together. May we strive together with vigour.",
    attribution: "Taittiriya Upanishad",
    kind: "shloka",
  },
  {
    line: "त्वमेव माता च पिता त्वमेव।",
    translation: "You alone are mother, father, companion, and kin.",
    attribution: "Traditional prayer",
    kind: "shloka",
  },
  {
    line: "Love, in the end, is the quiet undoing of every distance we thought we lived in.",
    attribution: "A line of our own",
    kind: "prose",
  },
  {
    line: "Some years are pages. These ten were the whole book.",
    attribution: "A line of our own",
    kind: "prose",
  },
];

export function quoteForPosition(i: number): Quote {
  return quotes[i % quotes.length];
}
