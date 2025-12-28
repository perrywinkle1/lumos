import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: "Lumos - The platform for independent voices",
  description:
    "Start a publication that combines a personal website, blog, and email newsletter. Lumos lets you publish, grow your audience, and get paid.",
  keywords: ["newsletter", "blog", "publication", "writing", "subscription"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spectral.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
