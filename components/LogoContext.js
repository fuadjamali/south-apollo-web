"use client";

import { createContext, useContext } from "react";

// The admin-uploaded logo URLs (lib/branding.js) — dark is "" when no dark-background variant
// has been uploaded, in which case consumers fall back to light. components/Logo.js falls back
// to its built-in vector mark when light is also "". Kept separate from BusinessNameContext.js
// (single responsibility) even though both are populated once in app/layout.js, since they
// change independently and nothing else needs them bundled together.
const LogoContext = createContext({ light: "", dark: "" });

export function LogoProvider({ logoUrl, logoDarkUrl, children }) {
  return (
    <LogoContext.Provider value={{ light: logoUrl || "", dark: logoDarkUrl || "" }}>
      {children}
    </LogoContext.Provider>
  );
}

// Used by the ~20 plain <Logo /> call sites across the site that only ever want the one (light)
// logo — unaffected by the header/footer's theme-aware variants below.
export function useLogoUrl() {
  return useContext(LogoContext).light;
}

export function useLogoUrls() {
  return useContext(LogoContext);
}
