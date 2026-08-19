"use client";

import { createContext, useContext } from "react";

// Only `name` — the one business_info field a Client Component actually needs (cart and
// membership pages render a small "back to <business name>" header). Everything else
// (tagline, description, domain) is only ever read in Server Components, which fetch
// lib/businessInfo.js directly instead of needing this context.
const BusinessNameContext = createContext("");

export function BusinessNameProvider({ name, children }) {
  return <BusinessNameContext.Provider value={name}>{children}</BusinessNameContext.Provider>;
}

export function useBusinessName() {
  return useContext(BusinessNameContext);
}
