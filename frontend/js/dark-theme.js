document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById('themeSwitch');
  const savedTheme = localStorage.getItem('theme');

  // Siempre aplicar clase dark-mode si corresponde
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');

    // Si el switch existe, marcamos como activado visualmente
    if (themeSwitch) {
      themeSwitch.checked = true;
    }
  }

  // Solo si existe el switch, agregamos el listener para cambiar de tema
  if (themeSwitch) {
    themeSwitch.addEventListener('change', () => {
      if (themeSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }
});
