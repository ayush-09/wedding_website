export const couple = {
  groom: {
    firstName: "Akash",
    lastName: "Varshney",
    initial: "A",
  },
  bride: {
    firstName: "Falguni",
    lastName: "Sharma",
    initial: "F",
  },
  monogram: "A&F",
  tagline: "Together forever, from 2027",

  weddingDate: "2027-01-23T11:00:00+05:30",
  weddingDateDisplay: "Twenty-Third of January, Two Thousand Twenty-Seven",
  engagementDate: "2026-11-21T19:00:00+05:30",
  engagementDateDisplay: "Twenty-First of November, Two Thousand Twenty-Six",
  venue: {
    name: "Kalash Banquet Hall",
    city: "Aligarh, Uttar Pradesh",
    mapsQuery: "Kalash Banquet Hall, Aligarh, Uttar Pradesh",
    // Exact short link supplied by the client — used directly for the
    // "Get directions" action so guests land on the precise pin.
    mapsUrl: "https://maps.app.goo.gl/VgmymXTFwREtyjRB9",
    // Coordinates resolved from the client's maps link
    // (Kalash Hotel and Banquet Hall, Aligarh).
    lat: 27.9262251,
    lng: 78.1280495,
  },

  hashtags: ["#AkashFindsHisFalguni", "#AkashAndFalguni2027", "#OmNamahShivaya"],
  contact: {
    rsvpEmail: "akashvarshney117@gmail.com",
  },

  families: {
    bride: {
      surname: "Sharma",
      father: "Shri Narendra Sharma",
      mother: "Smt. Preeti Sharma",
      withChildren: "along with their son Kshitiz",
      blessedBy: "with the blessings of Late Shri Om Prakash Sharma & Late Smt. Rajnesh Devi",
    },
    groom: {
      surname: "Varshney",
      father: "Shri Gopal Varshney",
      mother: "Smt. Neeru Varshney",
      withChildren: "along with their son Ayush",
      blessedBy: "with the blessings of Late Shri Suresh Chandra Varshney & Late Smt. Nirmala Devi",
    },
  },
} as const;

export type Couple = typeof couple;
