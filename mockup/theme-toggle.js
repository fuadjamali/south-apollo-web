(function () {
  var stored = localStorage.getItem("falcon-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  if (theme === "dark") document.documentElement.classList.add("dark");

  window.toggleFalconTheme = function () {
    var isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("falcon-theme", isDark ? "dark" : "light");
  };
})();
