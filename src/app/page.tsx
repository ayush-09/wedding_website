import { Hero } from "@/components/Hero";
import { Family } from "@/components/Family";
import { Story } from "@/components/Story";
import { Countdown } from "@/components/Countdown";
import { Events } from "@/components/Events";
import { Venue } from "@/components/Venue";
import { RSVPForm } from "@/components/RSVPForm";
import { Footer } from "@/components/Footer";
import { ClientOnly } from "@/components/ClientOnly";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      <ClientOnly>
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
