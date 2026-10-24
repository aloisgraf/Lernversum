import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

// Nunito (SIL Open Font License) wird beim Build geladen und von der eigenen Domain
// ausgeliefert; zur Laufzeit gibt es keine Abrufe bei Google.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

// Fredoka (SIL Open Font License) für Wortmarke und große Überschriften, nah an der
// runden Logo-Schrift im UI-Konzept; ebenfalls selbst ausgeliefert.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Lernversum",
  description: "Lernplattform für Kinder",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
