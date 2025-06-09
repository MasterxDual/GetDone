// Funcion para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedGroupId');
    localStorage.removeItem('selectedGroupRole');
    // Limpia cualquier otro dato sensible que guardes
    window.location.href = '../../views/auth/login.html';
}