/**
 * Gallery photo manifest. Each entry chooses:
 *   · `span`   — grid footprint (tall / wide / square)
 *   · `reveal` — entrance animation when the card scrolls into view
 *   · `hover`  — interaction style on pointer over
 *   · `focus`  — vertical focal point for `object-position` so the
 *                photo crops cleanly to faces/subjects when the
 *                full-bleed scroll reel forces a wider or taller
 *                aspect ratio than the photo itself
 *
 * Only photos that physically exist in `/public/images` and are
 * properly oriented (no sideways EXIF) are listed here. Reveals
 * and hovers are rotated across the set so adjacent photos never
 * share a transition.
 */
export type RevealKind =
  | "rise"
  | "scaleIn"
  | "swipeLeft"
  | "swipeRight"
  | "rotateIn"
  | "blurRise"
  | "diagonal";

export type HoverKind = "zoom" | "tilt" | "brightness" | "parallax";

export type GallerySpan = "tall" | "wide" | "square";

export type GalleryPhoto = {
  src: string;
  caption: string;
  year: number;
  span: GallerySpan;
  reveal: RevealKind;
  hover: HoverKind;
  focus?: string;
};

export const galleryPhotos: GalleryPhoto[] = [
  {
    src: "/images/IMG-20250201-WA0182.jpg.jpeg",
    caption: "Together",
    year: 2025,
    span: "tall",
    reveal: "rise",
    hover: "zoom",
    focus: "center 35%",
  },
  {
    src: "/images/IMG_0572.jpg.jpeg",
    caption: "Devotion",
    year: 2024,
    span: "wide",
    reveal: "scaleIn",
    hover: "tilt",
    focus: "center 70%",
  },
  {
    src: "/images/IMG_0907.jpg.jpeg",
    caption: "By the sea",
    year: 2025,
    span: "square",
    reveal: "swipeLeft",
    hover: "brightness",
    focus: "center 55%",
  },
  {
    src: "/images/IMG-20250419-WA0019.jpg.jpeg",
    caption: "Festivities",
    year: 2025,
    span: "square",
    reveal: "blurRise",
    hover: "parallax",
    focus: "center 30%",
  },
  {
    src: "/images/IMG_8637.JPG.jpeg",
    caption: "Smiles",
    year: 2024,
    span: "tall",
    reveal: "rotateIn",
    hover: "zoom",
    focus: "center 30%",
  },
  {
    src: "/images/Snapchat-398002590.jpg.jpeg",
    caption: "Adventures",
    year: 2024,
    span: "wide",
    reveal: "diagonal",
    hover: "tilt",
    focus: "center 45%",
  },
  {
    src: "/images/IMG-20250418-WA0069.jpg.jpeg",
    caption: "Soft evenings",
    year: 2025,
    span: "square",
    reveal: "swipeRight",
    hover: "brightness",
    focus: "center 30%",
  },
  {
    src: "/images/IMG_0252.JPG.jpeg",
    caption: "Golden hour",
    year: 2024,
    span: "square",
    reveal: "rise",
    hover: "zoom",
    focus: "center 70%",
  },
  {
    src: "/images/PSX_20231117_203648.jpg.jpeg",
    caption: "Beginnings",
    year: 2023,
    span: "wide",
    reveal: "scaleIn",
    hover: "brightness",
    focus: "center 25%",
  },
  {
    src: "/images/PSX_20241009_000557.jpg.jpeg",
    caption: "Joy",
    year: 2024,
    span: "tall",
    reveal: "swipeLeft",
    hover: "parallax",
    focus: "center 65%",
  },
  {
    src: "/images/IMG-20241225-WA0083.jpg.jpeg",
    caption: "Stillness",
    year: 2024,
    span: "square",
    reveal: "diagonal",
    hover: "zoom",
    focus: "center 25%",
  },
];
