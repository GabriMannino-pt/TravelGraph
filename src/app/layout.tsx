import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelGraph - Organizzazione Viaggi Multi-Agente",
  description: "Dì addio alla paralisi da scelta. TravelGraph organizza il tuo viaggio perfetto in modalità guidata o esplorazione al buio usando agenti intelligenti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 text-zinc-50 min-h-full font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
