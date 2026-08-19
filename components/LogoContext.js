"use client";

import { createContext, useContext } from "react";

// The admin-uploaded logo URL (lib/branding.js), or "" if none has been uploaded — components/
// Logo.js falls back to its built-in vector mark in that case. Kept separate from
// BusinessNameContext.js (single responsibility) even though both are populated once in
// app/layout.js, since they change independently and nothing else needs them bundled together.
const LogoContext = createContext("");

export function LogoProvider({ logoUrl, children }) {
  return <LogoContext.Provider value={logoUrl}>{children}</LogoContext.Provider>;
}

export function useLogoUrl() {
  return useContext(LogoContext);
}
