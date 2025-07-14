document.addEventListener("DOMContentLoaded", () => {
    // Al cargar, trae los datos actuales del usuario 
    fetchUserProfile();
});


/**
 * Trae el perfil actual y lo muestra en los inputs
 * @function fetchUserProfile
 * @description Realiza una solicitud HTTP para obtener los datos del perfil del usuario autenticado
 *              y los carga en los campos de entrada del formulario (firstName, lastName).
 *
 * @returns {void}
 * 
 * @example
 * // Carga el perfil del usuario en los inputs al iniciar la pantalla de configuración
 * fetchUserProfile();
 *
 * @note
 * Utiliza `fetch` con la opción `credentials: 'include'` para incluir cookies de sesión.
 * Si el perfil no puede ser cargado, muestra un mensaje de error con `showSettingsMessage`.
 */
function fetchUserProfile() {
    const token = localStorage.getItem('token'); // O sessionStorage.getItem('token')
    if (!token) {
        showSettingsMessage('No token found.', 'danger');
        return;
    }

    fetch('http://localhost:3000/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to fetch profile');
        }
        return res.json();
    })
    .then(data => {
        if (data.firstName) {
            document.getElementById('firstName').value = data.firstName;
        }
        if (data.lastName) {
            document.getElementById('lastName').value = data.lastName;
        }
    })
    .catch(err => {
        console.error(err);
        showSettingsMessage('Could not load profile.', 'danger');
    });
}



/**
 * @function updateField
 * @description Actualiza dinámicamente un campo específico del perfil del usuario 
 *              (firstName, lastName o password) mediante una solicitud HTTP PATCH.
 *
 * @param {string} field - El nombre del campo a actualizar. Puede ser:
 *                         'firstName', 'lastName' o 'confirmNewPassword'.
 *
 * @returns {void}
 *
 * @example
 * // Al perder el foco o al hacer clic en guardar para el campo nombre
 * updateField('firstName');
 *
 * @notes
 * - Para `firstName` y `lastName`, toma el valor del input respectivo y lo envía al backend.
 * - Para `confirmNewPassword`, delega la lógica a `updatePassword()`.
 * - Muestra mensajes de estado al usuario mediante la función `showSettingsMessage`.
 * - Utiliza cookies de sesión con `credentials: 'include'`.
 */
function updateField(field) {
    let value;
    let url;
    let payload = {};
    if (field === 'firstName') {
        value = document.getElementById('firstName').value.trim();
        url = 'http://localhost:3000/api/users/firstName';
        payload.firstName = value;
        if (!value) return showSettingsMessage('First name cannot be empty.', 'warning');
    } else if (field === 'lastName') {
        value = document.getElementById('lastName').value.trim();
        url = 'http://localhost:3000/api/users/lastName';
        payload.lastName = value;
        if (!value) return showSettingsMessage('Last name cannot be empty.', 'warning');
    } else if (field === 'confirmNewPassword') {
        // Lógica de cambio de password existente
        return updatePassword();
    } else {
        return;
    }

    fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showSettingsMessage('Updated successfully!', 'success');
        } else {
            showSettingsMessage(data.message || 'Error saving changes.', 'danger');
        }
    })
    .catch(err => {
        showSettingsMessage('Server error.', 'danger');
    });
}


/**
 * @function showSettingsMessage
 * @description Muestra un mensaje temporal en pantalla dentro del contenedor
 *              con ID `settingsMessage`, usando estilos de alerta de Bootstrap.
 *
 * @param {string} msg - El mensaje de texto que se mostrará al usuario.
 * @param {string} type - El tipo de alerta de Bootstrap (`'success'`, `'danger'`, `'warning'`, etc.).
 *
 * @returns {void}
 *
 * @example
 * // Mostrar mensaje de éxito
 * showSettingsMessage('Perfil actualizado correctamente.', 'success');
 *
 * @example
 * // Mostrar mensaje de error
 * showSettingsMessage('No se pudo guardar los cambios.', 'danger');
 */
function showSettingsMessage(msg, type) {
    const el = document.getElementById('settingsMessage');
    el.className = 'alert alert-' + type;
    el.innerText = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}



/**
 * Password update logic (puedes adaptar esto a tu backend)
 * @function updatePassword
 * @description Envía una solicitud al servidor para actualizar la contraseña del usuario actual.
 *              Verifica que los campos de contraseña estén completos y que las nuevas contraseñas coincidan.
 *              Muestra mensajes de estado usando `showSettingsMessage`.
 *
 * @returns {void}
 *
 * @example
 * // Al hacer clic en "Guardar cambios" para cambiar la contraseña:
 * updatePassword();
 */
function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return showSettingsMessage('Fill all password fields.', 'warning');
    }
    if (newPassword !== confirmNewPassword) {
        return showSettingsMessage('Passwords do not match.', 'warning');
    }

    fetch('http://localhost:3000/api/users/password', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showSettingsMessage('Password changed successfully!', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            showSettingsMessage(data.message || 'Password change failed.', 'danger');
        }
    })
    .catch(err => {
        showSettingsMessage('Server error.', 'danger');
    });
}

//Mostrar/ocultar contraseña
document.getElementById('showActualPassword').onclick = function() {
    togglePassword('currentPassword');
};
document.getElementById('showNewPassword').onclick = function() {
    togglePassword('newPassword');
};
document.getElementById('showRepeatedPassword').onclick = function() {
    togglePassword('confirmNewPassword');
};


/**
 * @function togglePassword
 * @description Alterna la visibilidad de un campo de entrada de tipo contraseña.
 *              Cambia el `type` del input entre `"password"` y `"text"` para mostrar u ocultar la contraseña.
 *
 * @param {string} fieldId - El ID del campo de entrada (`<input>`) cuyo tipo se desea alternar.
 *
 * @example
 * // HTML: <input type="password" id="myPasswordField">
 * // JS: togglePassword('myPasswordField'); // Ahora el campo es tipo "text"
 */
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = (input.type === 'password') ? 'text' : 'password';
}