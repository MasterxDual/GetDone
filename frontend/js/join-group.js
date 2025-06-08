/**
 * @event DOMContentLoaded
 * @description Configura el formulario para unirse a un grupo cuando el DOM está completamente cargado
 * 
 * Comportamiento:
 * 1. Obtiene referencias al formulario y elemento para mensajes
 * 2. Configura el event listener para el envío del formulario
 * 3. Realiza validaciones básicas del código de invitación y autenticación
 * 4. Envía la solicitud a la API para unirse al grupo
 * 5. Maneja la respuesta mostrando feedback al usuario
 * 6. Redirige después de unirse exitosamente (opcional)
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener elementos del DOM
    const form = document.getElementById('joinGroupForm'); // Formulario de unión
    const messageDiv = document.getElementById('message'); // Contenedor para mensajes
    const token = localStorage.getItem('token'); // Token de autenticación

    // 2. Configurar event listener para el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir comportamiento por defecto del formulario
        
        // 3. Validaciones iniciales
        const inviteCode = document.getElementById('inviteCodeInput').value.trim();

        // Validar que se ingresó un código
        if (!inviteCode) {
            messageDiv.textContent = 'Por favor ingresa un código de invitación.';
            messageDiv.className = 'text-danger';
            return;
        }

        // Validar que el usuario está autenticado
        if (!token) {
            messageDiv.textContent = 'No estás autenticado. Por favor inicia sesión.';
            messageDiv.className = 'text-danger';
            return;
        }

        try {
            // 4. Enviar solicitud a la API
            const res = await fetch('http://localhost:3000/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inviteCode })
            });

            // 5. Manejar respuesta de la API
            if (!res.ok) {
                const errorData = await res.json();
                messageDiv.textContent = errorData.message || 'Error al unirse al grupo.';
                messageDiv.className = 'text-danger';
                return;
            }

            // Éxito: mostrar mensaje y redirigir
            messageDiv.textContent = '¡Te has unido al grupo correctamente!';
            messageDiv.className = 'text-success';

            // 6. Redirección opcional después de 2 segundos
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);

        } catch (error) {
            // Manejar errores de red
            messageDiv.textContent = 'Error de red al intentar unirse al grupo.';
            messageDiv.className = 'text-danger';
            console.error('Error en joinGroup:', error);
        }
    });
});

/**
 * @function goToCreateGroup
 * @description Redirige a la página de creación de grupos
 * @returns {void}
 * 
 * Comportamiento:
 * - Navega a la página create-group.html
 * - No requiere parámetros ni retorna valores
 */
function goToCreateGroup() {
    window.location.href = "create-group.html";
}