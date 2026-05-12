import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Sora } from "next/font/google";
import { QuoteCartProvider } from "@/lib/quote-cart";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RRM Industrial Rubber Solutions",
  description:
    "Industrial rubber product catalog, RFQ workflow, and owner operations workspace for GCC markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${sora.variable} ${fraunces.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      {/* Explicit `dark:` variants on the body so theme flips are
          instant and don't depend on a single CSS variable resolving. */}
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          <QuoteCartProvider>{children}</QuoteCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
