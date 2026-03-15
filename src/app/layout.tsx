import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { RegisterSW } from "@/components/RegisterSW";
import { InstallPWA } from "@/components/InstallPWA";
import { NotificationManager } from "@/components/NotificationManager";
import { SessionProvider } from "@/components/SessionProvider";

const quicksand = Quicksand({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.vercel.app"),
  title: {
    default: "Dapur Ardya – Resep Masakan",
    template: "%s – Dapur Ardya",
  },
  description: "Kumpulan resep masakan yang mudah dan enak. Gratis untuk semua.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Dapur Ardya" },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    siteName: "Dapur Ardya",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Dapur Ardya" }],
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <SessionProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
            Dibuat oleh{" "}
            <a href="https://taratech.web.id" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">
              taratech.web.id
            </a>
          </footer>
          <RegisterSW />
          <InstallPWA />
          <NotificationManager />
        </SessionProvider>
      </body>
    </html>
  );
}
