import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { getCatalog } from "@/lib/products/db";
import type { Product } from "@/lib/products/types";
import CatalogProvider from "@/components/CatalogProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileTabBar from "@/components/MobileTabBar";
import Toaster from "@/components/Toaster";
import SiteLoader from "@/components/SiteLoader";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Xavier's Sports | Camisas de Futebol Atuais e Retrô",
    template: "%s | Xavier's Sports",
  },
  description:
    "Encontre camisas de clubes e seleções, modelos atuais e retrô. Consulte tamanhos, personalização e envio pelo WhatsApp.",
  openGraph: {
    title: "Xavier's Sports | Camisas de Futebol Atuais e Retrô",
    description:
      "Camisas de clubes e seleções, modelos atuais e retrô, com envio para todo o Brasil.",
    url: site.url,
    siteName: site.name,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let catalog: Product[] = [];
  let catalogError = false;
  try {
    catalog = await getCatalog();
  } catch {
    catalogError = true;
  }

  return (
    <html lang="pt-BR" className={`${barlow.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">
        <CatalogProvider products={catalog} error={catalogError}>
          <SiteLoader />
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
          <MobileTabBar />
          <WhatsAppButton />
          <Toaster />
        </CatalogProvider>
      </body>
    </html>
  );
}
