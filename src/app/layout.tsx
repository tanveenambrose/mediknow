import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mediknow - Trusted Medical Information & AI Assistant",
  description: "Explore clinical medicines, verify symptoms, and discuss medical queries with our dedicated AI Assistant on a high-trust, responsive clinical platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      style={{ height: "100%" }}
    >
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          margin: 0,
        }}
      >
        <Header />
        <main style={{ flex: "1 0 auto", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
