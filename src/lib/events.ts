export type EventVenue = {
  name: string;
  city: string;
  /** True while the location is a working placeholder and still
   *  being finalised. The Venue section renders a gold "tentative"
   *  badge + an italic hairline note so guests don't take the
   *  address as final. */
  tentative?: boolean;
};

export type WeddingEvent = {
  id: string;
  /** Ceremony name — Sanskrit-origin, shared across all three
   *  languages, so it lives directly on the event rather than in
   *  the i18n dictionary. */
  name: string;
  /** Namespace used to look up localized strings in lib/i18n.ts —
   *  e.g. events.haldi.subtitle / events.haldi.description / etc. */
  i18nKey: "haldi" | "mehendi" | "wedding";
  date: string;
  venue?: EventVenue;
  palette: string[];
  icon: "haldi" | "mehendi" | "sangeet" | "wedding" | "reception" | "blessing";
  song?: { title: string; film: string };
};

// Haldi + Mehndi happen at the Varshney family home in the groom's
// native place (Aligarh). Vivah is the main wedding at Kalash
// Banquet Hall. Sangeet & Reception venue is still being finalised —
// using a tentative guest house until it's locked in.
const VARSHNEY_HOME: EventVenue = {
  name: "Nirmala House",
  city: "New Bank Colony, Surendra Nagar, Aligarh",
};

const KALASH_BANQUET_HALL: EventVenue = {
  name: "Kalash Banquet Hall",
  city: "Aligarh, Uttar Pradesh",
};

const TENTATIVE_GUEST_HOUSE: EventVenue = {
  name: "Royal Orchid Guest House",
  city: "Aligarh, Uttar Pradesh",
  tentative: true,
};

export const events: WeddingEvent[] = [
  {
    id: "haldi",
    name: "Haldi",
    i18nKey: "haldi",
    date: "2027-01-21",
    venue: VARSHNEY_HOME,
    palette: ["#F4C430", "#E89B2B", "#FFF4D6"],
    icon: "haldi",
    song: { title: "Mehndi Laga Ke Rakhna", film: "DDLJ, 1995" },
  },
  {
    id: "mehendi",
    name: "Mehndi",
    i18nKey: "mehendi",
    date: "2027-01-22",
    venue: VARSHNEY_HOME,
    palette: ["#4A5D3F", "#C2185B", "#F2E8D5"],
    icon: "mehendi",
    song: { title: "Mehndi Hai Rachnewali", film: "Zubeidaa, 2001" },
  },
  {
    id: "wedding",
    name: "Wedding",
    i18nKey: "wedding",
    date: "2027-01-23",
    venue: KALASH_BANQUET_HALL,
    palette: ["#5C1F2B", "#FAF3E7", "#C9A961"],
    icon: "wedding",
    song: { title: "Tujhe Dekha Toh Yeh Jaana Sanam", film: "DDLJ, 1995" },
  },
];
