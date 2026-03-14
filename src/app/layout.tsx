import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const quicksand = Quicksand({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dapur Ardya – Resep Masakan",
  description: "Kumpulan resep masakan yang mudah dan enak. Gratis untuk semua.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Dapur Ardya" },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${quicksand.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
