import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito (SIL Open Font License) wird beim Build geladen und von der eigenen Domain
// ausgeliefert; zur Laufzeit gibt es keine Abrufe bei Google.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Lernversum",
  description: "Lernplattform für Kinder",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
