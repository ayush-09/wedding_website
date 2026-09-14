export type Chapter = {
  year: number;
  title: string;
  city?: string;
  body: string;
  motif: "meet" | "friends" | "first-date" | "travel" | "distance" | "move-in" | "proposal" | "now";
};

export const timeline: Chapter[] = [
  {
    year: 2017,
    title: "We met",
    city: "Delhi",
    body: "A crowded hallway. A quiet thank-you. Nothing happened — and then everything did.",
    motif: "meet",
  },
  {
    year: 2019,
    title: "The first real evening",
    city: "Connaught Place",
    body: "Coffee became dinner, dinner became a walk, the walk became a confession under yellow streetlights.",
    motif: "first-date",
  },
  {
    year: 2023,
    title: "A home of our own",
    city: "Gurgaon",
    body: "Two furniture-store trips, one argument about a rug, a kitchen that finally smells like home.",
    motif: "move-in",
  },
  {
    year: 2025,
    title: "The question",
    city: "Udaipur",
    body: "A rooftop at the hour the lake goes gold. She said yes before he finished asking.",
    motif: "proposal",
  },
  {
    year: 2027,
    title: "Forever begins",
    body: "Ten years quietly become the rest of our lives \u2014 in front of everyone who made us.",
    motif: "now",
  },
];
