import { Geist, Geist_Mono } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ThemeScript from "@/components/ThemeScript";
import { CartProvider } from "@/components/CartContext";
import siteConfig from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: siteConfig.business.name,
    template: `%s — ${siteConfig.business.name}`,
  },
  description: siteConfig.business.description,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProviderWrapper>
          <CartProvider>{children}</CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
