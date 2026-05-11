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
      {/* `bg-[var(...)]` + `text-[var(...)]` keeps the body in sync with
          the active theme via the CSS variables defined in globals.css. */}
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        <ThemeProvider>
          <QuoteCartProvider>{children}</QuoteCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
