document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileSettingsForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const messageBox = document.getElementById('settingsMessage');
    const showActualPasswordBtn = document.getElementById('showActualPassword');
    const showNewPasswordBtn = document.getElementById('showNewPassword');
    const showConfirmNewPasswordBtn = document.getElementById('showRepeatedPassword');

    // Mostrar/ocultar contraseña
    function togglePasswordVisibility(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    }

    // Cargar datos del usuario al iniciar
    async function fetchUserProfile() {
        try {
            const res = await fetch("http://localhost:3000/api/users/profile", {
                credentials: 'include'
            });
            const user = await res.json();
            firstNameInput.value = user.firstName || '';
            lastNameInput.value = user.lastName || '';
            emailInput.value = user.email || '';
        } catch (err) {
            showMessage('Error loading profile data', 'danger');
        }
    }

    /**
    * Envía una solicitud PATCH al backend para actualizar un campo específico del perfil del usuario.
    *
    * @async
    * @function updateField
    * @param {string} field - El nombre del campo del perfil a actualizar (por ejemplo, 'firstName', 'lastName').
    * 
    * @description
    * Obtiene el nuevo valor del campo desde el DOM, lo envía al backend como una solicitud PATCH,
    * y muestra un mensaje de éxito o error en un contenedor de notificaciones.
    * 
    * @returns {Promise<void>} No devuelve ningún valor directamente, pero actualiza la interfaz de usuario según la respuesta.
    */
    async function updateField(field) {
        const value = document.getElementById(field).value;
          
        const res = await fetch("http://localhost:3000/api/users/profile", {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ field, value })
        });
      
        const data = await res.json();
        // const messageEl = document.getElementById('settingsMessage');


        messageBox.style.display = 'block';
        messageBox.className = 'alert alert-' + (res.ok ? 'success' : 'danger');
        messageBox.textContent = data.message;
    }


    fetchUserProfile();

    // Mostrar mensajes de éxito/error
    function showMessage(msg, type = 'success') {
        messageBox.textContent = msg;
        messageBox.className = `alert alert-${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => messageBox.style.display = 'none', 4000);
    }

    /* // Validación y envío de formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar nombres
        if (!firstNameInput.value.trim() || !lastNameInput.value.trim()) {
            showMessage('Completa los campos de nombre y apellido.', 'danger');
            return;
        }

        // Validar cambio de contraseña solo si hay datos
        let passwordData = {};
        if (currentPasswordInput.value || newPasswordInput.value || confirmNewPasswordInput.value) {
            if (!currentPasswordInput.value || !newPasswordInput.value || !confirmNewPasswordInput.value) {
                showMessage('Completa todos los campos de contraseña para cambiarla.', 'danger');
                return;
            }
            if (newPasswordInput.value.length < 8) {
                showMessage('La nueva contraseña debe tener al menos 8 caracteres.', 'danger');
                return;
            }
            if (newPasswordInput.value !== confirmNewPasswordInput.value) {
                showMessage('Las contraseñas nuevas no coinciden.', 'danger');
                return;
            }
            passwordData = {
                currentPassword: currentPasswordInput.value,
                newPassword: newPasswordInput.value
            };
        }

        // Enviar datos al backend
        try {
            const res = await fetch('http://localhost:3000/api/users/updateProfile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstNameInput.value.trim(),
                    lastName: lastNameInput.value.trim(),
                    ...passwordData
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('Datos actualizados correctamente.', 'success');
                // Limpiar campos contraseña
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
            } else {
                showMessage(data.message || 'No se pudo actualizar el perfil.', 'danger');
            }
        } catch (err) {
            showMessage('Error de red.', 'danger');
        }
    }); */

    // Mostrar/ocultar contraseña
    if (showActualPasswordBtn) {
        showActualPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('currentPassword', 'showActualPassword');
        });
    }
    if (showNewPasswordBtn) {
        showNewPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('newPassword', 'showNewPassword');
        });
    }

    if (showConfirmNewPasswordBtn) {
        showConfirmNewPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('confirmNewPassword', 'showRepeatedPassword');
        });
    }
});