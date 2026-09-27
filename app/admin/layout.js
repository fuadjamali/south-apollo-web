import { LocaleProvider } from "@/components/LocaleContext";

// The admin panel is English-only even when the visitor's site language is Bangla (the root
// <html lang> follows that choice). Re-providing "en" here keeps shared components that call
// useT() (e.g. ThemeToggle in AdminHeader) English inside admin. `contents` keeps the wrapper
// out of the layout box tree — it only scopes lang="en" for screen readers and fonts.
export default function AdminAreaLayout({ children }) {
  return (
    <LocaleProvider locale="en">
      <div lang="en" className="contents">
        {children}
      </div>
    </LocaleProvider>
  );
}
