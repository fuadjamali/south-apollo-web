import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import siteConfig from "@/config/site";

export default function AdminLayout({ children }) {
  const { business, admin } = siteConfig;

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Logo className="h-6 w-6" />
            {business.name}{" "}
            <span className="font-normal text-muted">Admin</span>
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-6 pb-4 text-sm font-medium">
          {admin.nav.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={
                index === 0
                  ? "border-b-2 border-primary pb-1 text-foreground"
                  : "text-muted hover:text-foreground"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex min-h-[calc(100vh-113px)] items-center justify-center px-6">
        {children}
      </main>
    </div>
  );
}
