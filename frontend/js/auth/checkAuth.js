/**
 * checkAuth.js
 * Verifica si el usuario está autenticado mediante la existencia del token en localStorage.
 * Si no está autenticado, redirige a la página de login.
 */

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para acceder a esta página.');
        // Redirige a la página de inicio de sesión
        window.location.href = '/frontend/views/auth/login.html';
    }
}