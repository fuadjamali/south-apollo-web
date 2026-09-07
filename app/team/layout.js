import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getContentMaxWClass } from "@/lib/homeLayout";

export default async function TeamLayout({ children }) {
  const [business, contentMaxW] = await Promise.all([getBusinessInfo(), getContentMaxWClass()]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <div className="flex items-center gap-3 text-sm font-medium sm:gap-6">
            <a href="/" className="hover:text-muted">
              Home
            </a>
            <a href="/team" className="hover:text-muted">
              Team
            </a>
            <ColorThemeSwitcher className="hidden sm:inline-block" />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className={`mx-auto ${contentMaxW} px-6 py-16`}>{children}</main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <a href="/" className="hover:text-foreground">
          &larr; Back to home
        </a>
        <p className="mt-4">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
