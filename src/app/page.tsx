import { Hero } from "@/components/Hero";
import { Family } from "@/components/Family";
import { Story } from "@/components/Story";
import { Countdown } from "@/components/Countdown";
import { Events } from "@/components/Events";
import { Venue } from "@/components/Venue";
import { RSVPForm } from "@/components/RSVPForm";
import { Footer } from "@/components/Footer";
import { ClientOnly } from "@/components/ClientOnly";
import { useEffect } from "react";

function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFirst = () => {
      try {
        // Dispatch custom gesture event so CinematicIntro can treat
        // this as a user interaction and unlock intro autoplay
        // without forcing a full page reload.
        window.dispatchEvent(new Event("fa-user-gesture"));
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("touchstart", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst as any);
      window.removeEventListener("touchstart", onFirst as any);
    };
  }, []);
  return null;
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      <ClientOnly>
        <FirstClickReplay />
        <Hero />
      </ClientOnly>
      <Family />
      <Story />
      <ClientOnly>
        <Countdown />
      </ClientOnly>
      <Events />
      <Venue />
      <RSVPForm />
      <Footer />
    </main>
  );
}
