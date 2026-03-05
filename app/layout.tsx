import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Laconic - Maximum Meaning, Minimum Tokens",
    template: "%s | Laconic",
  },
  description:
    "Cut your LLM token costs with lossless markdown compression. Sub-millisecond performance, zero semantic loss.",
  keywords: [
    "LLM",
    "tokens",
    "markdown",
    "compression",
    "GPT",
    "Claude",
    "AI",
    "cost reduction",
    "healthcare",
    "HIPAA",
  ],
  authors: [{ name: "copyleftdev" }],
  creator: "copyleftdev",
  metadataBase: new URL("https://laconic-docs.vercel.app"),
  openGraph: {
    title: "Laconic - Maximum Meaning, Minimum Tokens",
    description: "Cut your LLM token costs with lossless markdown compression.",
    type: "website",
    siteName: "Laconic",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laconic - Maximum Meaning, Minimum Tokens",
    description: "Cut your LLM token costs with lossless markdown compression.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161b22" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
