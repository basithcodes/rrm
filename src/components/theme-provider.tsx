"use client";

// =====================================================================
// ThemeProvider
// ---------------------------------------------------------------------
// Thin wrapper around next-themes so the rest of the app can stay
// strictly server-side. Uses `attribute="class"` so we toggle the
// `.dark` class on <html>, which both Tailwind v4 (`@variant dark`)
// and our `globals.css` CSS variables react to.
// =====================================================================

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
