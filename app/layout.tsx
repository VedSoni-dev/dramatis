import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import config from "@/studio.config";
import "./globals.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ff-stage", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(config.app.url),
  title: { default: `${config.app.name}: ${config.app.tagline}`, template: `%s · ${config.app.name}` },
  description: config.app.tagline,
  openGraph: { title: config.app.name, description: config.app.tagline, url: config.app.url, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: config.app.name, description: config.app.tagline, images: ["/og.png"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#111111", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-type="software" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
