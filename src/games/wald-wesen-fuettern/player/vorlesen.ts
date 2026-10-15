"use client";

import { useCallback, useEffect, useState } from "react";

// Übergangslösung, bis aufgenommene Sprecherstimmen vorliegen (Spielkonzept).
// Datenschutz: Es werden ausschließlich Stimmen verwendet, die auf dem Gerät selbst laufen
// (localService). Online-Stimmen des Browsers würden den Text an Dritte senden und sind daher
// ausgeschlossen. Gibt es keine lokale deutsche Stimme, bleibt der Knopf ausgeblendet.

function lokaleDeutscheStimme(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const stimmen = window.speechSynthesis
    .getVoices()
    .filter((s) => s.localService && s.lang.toLowerCase().startsWith("de"));
  return stimmen.find((s) => s.lang.toLowerCase() === "de-de") ?? stimmen[0] ?? null;
}

export function useVorlesen() {
  const [stimme, setStimme] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const aktualisieren = () => setStimme(lokaleDeutscheStimme());
    aktualisieren();
    window.speechSynthesis.addEventListener("voiceschanged", aktualisieren);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", aktualisieren);
      window.speechSynthesis.cancel();
    };
  }, []);

  const sprich = useCallback(
    (text: string) => {
      if (!stimme) return;
      window.speechSynthesis.cancel();
      const satz = new SpeechSynthesisUtterance(text);
      satz.voice = stimme;
      satz.lang = stimme.lang;
      satz.rate = 0.8;
      window.speechSynthesis.speak(satz);
    },
    [stimme],
  );

  return { verfuegbar: stimme !== null, sprich };
}
