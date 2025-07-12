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

    // Mostrar mensajes de éxito/error
    function showMessage(msg, type = 'success') {
        messageBox.textContent = msg;
        messageBox.className = `alert alert-${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => messageBox.style.display = 'none', 4000);
    }


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