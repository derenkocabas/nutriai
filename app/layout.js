import "./globals.css";

export const metadata = {
  title: "NutriAI — Kişisel Diyetisyen Asistanın",
  description: "Boy, kilo ve hedeflerine göre kişiselleştirilmiş beslenme ve spor önerileri.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
