import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haggle — the merchant's counter-agent",
  description:
    "When a shopper's AI agent walks into your store, Haggle negotiates back — in a Band room, on your terms, in seconds.",
  openGraph: {
    title: "Haggle — the merchant's counter-agent",
    description: "Shopper agents are here. Haggle is what your store answers with.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..800,0..100&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
