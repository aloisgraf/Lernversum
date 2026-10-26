import type { Metadata } from "next";
import { Fredoka, Nunito, Patrick_Hand } from "next/font/google";
import "./globals.css";

// Nunito (SIL Open Font License) wird beim Build geladen und von der eigenen Domain
// ausgeliefert; zur Laufzeit gibt es keine Abrufe bei Google.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

// Fredoka (SIL Open Font License) für Überschriften im Adminbereich; selbst ausgeliefert.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

// Patrick Hand (SIL Open Font License) für Wortmarke und Kinderbereich (Überschriften,
// Knöpfe), auf Wunsch von Alois (2026-10-26); ebenfalls selbst ausgeliefert.
const patrickHand = Patrick_Hand({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  title: "Lernversum",
  description: "Lernplattform für Kinder",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} ${patrickHand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
