document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.getElementById('themeSwitch');
    
    // Cargar preferencia guardada (si la hay)
    const savedTheme = localStorage.getItem('theme');

    // Verificar si hay un tema guardado o si el usuario prefiere el modo oscuro y lo mantiene aunque la pagina se recargue
    if (savedTheme === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    // Cambiar tema al hacer toggle
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
        } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
        }
    });
});