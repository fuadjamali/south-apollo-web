const THEME_SCRIPT = `
(function () {
  var storedMode = localStorage.getItem("falcon-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var mode = storedMode || (prefersDark ? "dark" : "light");
  if (mode === "dark") document.documentElement.classList.add("dark");

  var storedColor = localStorage.getItem("falcon-color-theme") || "ocean";
  document.documentElement.setAttribute("data-theme", storedColor);
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
