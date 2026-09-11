(function () {
  const theme =
    localStorage.getItem('praxis-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
})();
