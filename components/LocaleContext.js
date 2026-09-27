"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/translate";

// The locale is resolved once per request on the server (lib/i18n/server.js getLocale) and
// handed down here, so client components translate with exactly the same choice the server
// rendered with — no flash of the other language on hydration.
const LocaleContext = createContext(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useContext(LocaleContext);
  return useMemo(() => makeT(locale), [locale]);
}
