import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import config from "@/studio.config";
import "./globals.css";

// One family (with its italics, for the characters' stage directions) and one mono for labels: DESIGN.md.
const sans = Schibsted_Grotesk({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(config.app.url),
  title: { default: `${config.app.name}: free, open-source AI character chat`, template: `%s · ${config.app.name}` },
  description: "Chat with eight ready-made AI characters or describe a new one in a line. Free and open source.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: config.app.name, description: config.app.tagline, url: config.app.url, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: config.app.name, description: config.app.tagline, images: ["/og.png"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0a0d14", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
