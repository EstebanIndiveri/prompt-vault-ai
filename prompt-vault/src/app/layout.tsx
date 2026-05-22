import type { Metadata } from "next";
import { Playfair_Display, Lora, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Prompt Vault",
  description: "Tu biblioteca personal de prompts de Copilot y AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${lora.variable} ${dmSans.variable} h-full`}
    >
      <body
        className="h-full"
        style={{ fontFamily: "var(--font-sans)", background: "var(--bg)" }}
      >
        {children}
      </body>
    </html>
  );
}
