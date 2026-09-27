// Runs before first paint (inline in <head>) so there's no flash of the wrong mode/palette.
// A saved color palette is only honored while Feature Config's theme switcher is on — with it
// off there's no picker on the site, so an earlier choice would otherwise be stuck forever;
// everyone gets the default "ocean" palette instead.
function buildScript(colorThemesEnabled) {
  return `
(function () {
  var storedMode = localStorage.getItem("south-apollo-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var mode = storedMode || (prefersDark ? "dark" : "light");
  if (mode === "dark") document.documentElement.classList.add("dark");

  var storedColor = ${colorThemesEnabled ? 'localStorage.getItem("south-apollo-color-theme")' : "null"};
  document.documentElement.setAttribute("data-theme", storedColor || "ocean");
})();
`;
}

export default function ThemeScript({ colorThemesEnabled = true }) {
  return <script dangerouslySetInnerHTML={{ __html: buildScript(colorThemesEnabled) }} />;
}
