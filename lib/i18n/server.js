import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/translate";

// A visitor's own earlier choice (cookie set by LanguageSwitcher) always wins. With no choice
// yet: visitors in Bangladesh (Vercel's geo header — absent locally) or whose browser's first
// preferred language is Bangla get Bangla; everyone else English.
export async function getLocale() {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const requestHeaders = await headers();
  if (requestHeaders.get("x-vercel-ip-country") === "BD") return "bn";

  const firstLanguage = (requestHeaders.get("accept-language") || "").split(",")[0].trim();
  if (/^bn\b/i.test(firstLanguage)) return "bn";

  return DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
