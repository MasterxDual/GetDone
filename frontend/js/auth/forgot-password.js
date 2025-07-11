/**
 * Recuperación y restablecimiento de contraseña
 * Reutiliza la lógica de verificación por código adaptada para restablecer contraseña
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verificationCodeInput = document.getElementById('verificationCode');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const showPasswordBtn = document.getElementById('showPassword');
    const showConfirmPasswordBtn = document.getElementById('showConfirmPassword');

    let generatedCode = null;
    let emailVerified = false;

    // Inicialmente, deshabilitar campos de contraseña
    [passwordInput, confirmPasswordInput, showPasswordBtn, showConfirmPasswordBtn].forEach(el => {
        if (el) el.disabled = true;
    });
    if (verificationCodeInput) verificationCodeInput.disabled = true;

    // Generar código de 4 dígitos
    function generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    // Mostrar mensaje en pantalla
    function mostrarMensaje(texto, tipo) {
        const mensajeElemento = document.getElementById('mensaje');
        if (!mensajeElemento) return;
        mensajeElemento.textContent = texto;
        mensajeElemento.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'}`;
        mensajeElemento.style.display = 'block';
        setTimeout(() => {
            mensajeElemento.style.display = 'none';
        }, 5000);
    }

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

    // Evento para enviar código al email
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', async () => {
            const email = form.email.value.trim().toLowerCase();
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                mostrarMensaje('Por favor, ingresa un correo electrónico válido.', 'danger');
                return;
            }
            generatedCode = generateCode();
            try {
                const response = await fetch('http://localhost:3000/api/users/sendResetPasswordCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code: generatedCode })
                });
                const data = await response.json();
                if (response.ok) {
                    mostrarMensaje('Código enviado a tu correo electrónico.', 'success');
                    if (verificationCodeInput) verificationCodeInput.disabled = false;
                } else {
                    mostrarMensaje(data.message || 'Error al enviar el código. Intenta nuevamente.', 'danger');
                }
            } catch (error) {
                console.error('Error al enviar código:', error);
                mostrarMensaje('Error al enviar el código. Intenta nuevamente.', 'danger');
            }
        });
    }

    // Validar el código ingresado
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', () => {
            const enteredCode = verificationCodeInput.value.trim();
            if (enteredCode.length === 4) {
                if (enteredCode === generatedCode) {
                    emailVerified = true;
                    mostrarMensaje('Código verificado correctamente.', 'success');
                    [passwordInput, confirmPasswordInput, showPasswordBtn, showConfirmPasswordBtn].forEach(el => {
                        if (el) el.disabled = false;
                    });
                    verificationCodeInput.disabled = true;
                    sendCodeBtn.disabled = true;
                } else {
                    emailVerified = false;
                    mostrarMensaje('Código incorrecto. Por favor, verifica e intenta nuevamente.', 'danger');
                }
            }
        });
    }

    // Enviar nuevo password
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!emailVerified) {
            mostrarMensaje('Verifica tu correo antes de restablecer la contraseña.', 'danger');
            return;
        }
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const email = form.email.value.trim().toLowerCase();

        if (password !== confirmPassword) {
            mostrarMensaje('Las contraseñas no coinciden.', 'danger');
            return;
        }
        if (password.length < 8) {
            mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/resetPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                mostrarMensaje('Contraseña restablecida correctamente. Ahora puedes iniciar sesión.', 'success');
                form.reset();
                setTimeout(() => {
                    window.location.href = '/views/auth/login.html';
                }, 2500);
            } else {
                mostrarMensaje(data.message || 'No se pudo restablecer la contraseña.', 'danger');
            }
        } catch (error) {
            mostrarMensaje('Error al restablecer contraseña.', 'danger');
        }
    });

    // Mostrar/ocultar contraseña
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('password', 'showPassword');
        });
    }
    if (showConfirmPasswordBtn) {
        showConfirmPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('confirmPassword', 'showConfirmPassword');
        });
    }
});