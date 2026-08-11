const THEME_SCRIPT = `
(function () {
  var stored = localStorage.getItem("falcon-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  if (theme === "dark") document.documentElement.classList.add("dark");
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
