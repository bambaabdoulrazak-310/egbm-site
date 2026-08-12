import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://egbmci.com"),
  title: {
    default: "EGBM — Entreprise Générale Bamba Mamadou",
    template: "%s · EGBM",
  },
  description:
    "EGBM — génie civil, distribution agro-chimique et matériaux industriels à Korhogo, Côte d'Ivoire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${barlowCondensed.variable} ${inter.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        {children}
      </body>
    </html>
  );
}
