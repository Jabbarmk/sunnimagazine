import type { Metadata } from "next";
import { Poppins, Playfair_Display, Lora, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-poppins", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const malayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "600", "700"],
  variable: "--font-malayalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gulf Sathyadhara",
  description: "Gulf Sathyadhara Magazine App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ml" className={`${poppins.variable} ${playfair.variable} ${lora.variable} ${malayalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
