import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ThemeScript from "@/components/ThemeScript";
import { CartProvider } from "@/components/CartContext";
import { BusinessNameProvider } from "@/components/BusinessNameContext";
import { LogoProvider } from "@/components/LogoContext";
import { LocaleProvider } from "@/components/LocaleContext";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getBranding } from "@/lib/branding";
import { getRootAlert } from "@/lib/rootAlert";
import { getLocale } from "@/lib/i18n/server";
import { getModuleStates, isEnabled } from "@/lib/plan";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only the Bengali subset, not preloaded: its @font-face is limited to the Bengali Unicode
// range, so English-only visitors never download it — the browser fetches it the first time
// Bengali text actually renders (globals.css puts it after Arial in the body font stack).
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  preload: false,
});

// Dynamic (not a static `metadata` export) so the browser tab title / SEO title / favicon
// reflect admin-editable values (lib/businessInfo.js, lib/branding.js) instead of hardcoded
// ones. `icons` is only set when a custom favicon/apple-icon has actually been uploaded at
// /admin/logo — omitting the key otherwise lets Next.js's file-convention app/icon.svg keep
// applying exactly as before, rather than this having to duplicate that fallback itself.
export async function generateMetadata() {
  const [business, branding] = await Promise.all([getBusinessInfo(), getBranding()]);
  const icons = {};
  if (branding.favicon_url) icons.icon = branding.favicon_url;
  if (branding.apple_icon_url) icons.apple = branding.apple_icon_url;

  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: {
      default: business.name,
      template: `%s — ${business.name}`,
    },
    description: business.description,
    ...(Object.keys(icons).length > 0 && { icons }),
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const [business, branding, rootAlert, moduleStates] = await Promise.all([
    getBusinessInfo(),
    getBranding(),
    getRootAlert(locale),
    getModuleStates(),
  ]);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript colorThemesEnabled={isEnabled("themes", moduleStates)} />
      </head>
      <body className="min-h-full flex flex-col">
        {rootAlert.enabled && rootAlert.message && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
            {rootAlert.message}
          </div>
        )}
        <LocaleProvider locale={locale}>
          <BusinessNameProvider name={business.name}>
            <LogoProvider logoUrl={branding.logo_url} logoDarkUrl={branding.logo_dark_url}>
              <SessionProviderWrapper>
                <CartProvider>{children}</CartProvider>
              </SessionProviderWrapper>
            </LogoProvider>
          </BusinessNameProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
