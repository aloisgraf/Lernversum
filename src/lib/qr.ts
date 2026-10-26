import qrcode from "qrcode-generator";

// QR-Code als Zeilen aus "1" (dunkel) und "0" (hell), damit er ohne Bilddatei und ohne
// `dangerouslySetInnerHTML` als SVG gezeichnet werden kann. Fehlerkorrektur M (15 %).
export function qrZeilen(text: string): string[] {
  if (text.length === 0 || text.length > 200) throw new Error("QR-Inhalt ungültig.");
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  const zeilen: string[] = [];
  for (let r = 0; r < n; r++) {
    let zeile = "";
    for (let c = 0; c < n; c++) zeile += qr.isDark(r, c) ? "1" : "0";
    zeilen.push(zeile);
  }
  return zeilen;
}
