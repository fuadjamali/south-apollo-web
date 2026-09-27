(function () {
  var stored = localStorage.getItem("south-apollo-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  if (theme === "dark") document.documentElement.classList.add("dark");

  window.toggleSouthApolloTheme = function () {
    var isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("south-apollo-theme", isDark ? "dark" : "light");
  };
})();
