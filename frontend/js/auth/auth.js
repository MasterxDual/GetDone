/**
 * Agrega un evento de clic al botón para mostrar/ocultar la contraseña
 * 
 * Este código permite alternar entre mostrar y ocultar el texto de la contraseña
 * cuando el usuario hace clic en el ícono del ojo, cambiando simultáneamente
 * el ícono visual para reflejar el estado actual.
 */
document.getElementById('showPassword').addEventListener('click', function() {
    // Obtiene el elemento de input de contraseña del DOM
    const passwordInput = document.getElementById('password');
    
    // Obtiene el elemento del ícono (tag <i>) dentro del botón
    const icon = this.querySelector('i');

    // Verifica si el input está actualmente en modo contraseña (oculto)
    if (passwordInput.type === 'password') {
        // Cambia a texto visible
        passwordInput.type = 'text';
        // Cambia el ícono a "ojo tachado" (indicando que la contraseña es visible)
        icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        // Vuelve a modo contraseña (oculto)
        passwordInput.type = 'password';
        // Cambia el ícono a "ojo abierto" (indicando que la contraseña está oculta)
        icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
});