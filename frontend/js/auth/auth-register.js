

/**
 * Inicializa el formulario de registro
 */
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar el formulario de Registro
    const form = document.getElementById('registerForm');

    // Disable all fields except firstName, lastName, email initially
    const fieldsToDisable = ['password', 'confirmPassword', 'showPassword', 'showConfirmPassword'];
    fieldsToDisable.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });

    // Also disable other fields if any (assuming only these fields for now)
    // Add a new input for verification code and a button to send code
    // Assuming these elements exist in the HTML with ids 'verificationCode' and 'sendCodeBtn'
    const verificationCodeInput = document.getElementById('verificationCode');
    const sendCodeBtn = document.getElementById('sendCodeBtn');

    if (verificationCodeInput) verificationCodeInput.disabled = true;

    let generatedCode = null;
    let emailVerified = false;

    // Function to generate 4-digit random code
    function generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    // Event listener for send code button
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', async () => {
            const email = form.email.value.trim().toLowerCase();
            if (!email) {
                mostrarMensaje('Por favor, ingresa un correo electrónico válido para enviar el código.');
                return;
            }
            generatedCode = generateCode();
            // console.log('Código generado:', generatedCode); // For debugging, remove in production

            try {
                // Send the code to backend to email the user
                const response = await fetch('http://localhost:3000/api/users/sendVerificationCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, code: generatedCode })
                });

                const data = await response.json();

                if (response.ok) {
                    mostrarMensaje('Código de verificación enviado a tu correo electrónico.', 'success');
                    if (verificationCodeInput) verificationCodeInput.disabled = false;
                } else {
                    mostrarMensaje(data.message || 'Error al enviar el código. Intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error al enviar código:', error);
                mostrarMensaje('Error al enviar el código. Intenta nuevamente.');
            }
        });
    }

    // Event listener for verification code input to validate code
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', () => {
            const enteredCode = verificationCodeInput.value.trim();
            if (enteredCode.length === 4) {
                if (enteredCode === generatedCode) {
                    emailVerified = true;
                    mostrarMensaje('Correo electrónico verificado correctamente.', 'success');
                    // Enable password fields and show/hide buttons
                    fieldsToDisable.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.disabled = false;
                    });
                    verificationCodeInput.disabled = true;
                    sendCodeBtn.disabled = true;
                } else {
                    emailVerified = false;
                    mostrarMensaje('Código incorrecto. Por favor, verifica e intenta nuevamente.');
                }
            }
        });
    }

    // Escuchar el evento submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que se recargue la pagina al enviar el formulario

        if (!emailVerified) {
            mostrarMensaje('Por favor, verifica tu correo electrónico antes de registrarte.');
            return;
        }

        const password = form.password.value; // Capturar la contraseña de usuario
        const confirmPassword = form.confirmPassword.value; // Capturar la confirmacion de contraseña de usuario

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            mostrarMensaje('Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.');
            return; // Salir de la función si las contraseñas no coinciden
        }

        if (password.length < 8) {
            mostrarMensaje('La contraseña debe tener al menos 8 caracteres.');
            return; // Salir de la función si la contraseña es demasiado corta
        }

        // Obtener los valores de los campos del formulario
        const user = {
            firstName: form.firstName.value, // Capturar el nombre de usuario
            lastName: form.lastName.value, // Capturar el apellido de usuario
            email: form.email.value.trim().toLowerCase(), // Capturar el email de usuario y eliminar espacios en blanco
            password: form.password.value // Capturar la contraseña de usuario
        };

        // Validar que todos los campos estén completos
        if (!user.firstName || !user.email || !user.password) {
            mostrarMensaje('Por favor, completa todos los campos.');
            return; // Salir de la función si algún campo está vacío
        }

        try {
            // Fetch para hacer una peticion POST al backend (Enviar datos al backend)
            const answer = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST', // Método de la petición
                headers: {
                    'Content-Type': 'application/json' // Tipo de contenido que se está enviando
                },
                body: JSON.stringify(user) // Convertir el objeto user a JSON
            });

            const dataAnswer = await answer.json(); // Convertir la respuesta a JSON

            if (answer.ok) {
                // Si la respuesta es exitosa, redirigir al usuario a la página de inicio de sesión
                mostrarMensaje('Usuario registrado exitosamente. Por favor, inicia sesión.');
                form.reset(); // Limpiar el formulario
                window.location.href = '/views/auth/login.html'; // Redirigir a la página de inicio de sesión
            } else {
                mostrarMensaje(dataAnswer.message ||'Error al registrar usuario. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error); // Mostrar el error en la consola
            mostrarMensaje('Error al registrar usuario. Por favor, intenta nuevamente.');
        }
    });

    // Funcionalidades para mostrar/ocultar contraseña
    document.getElementById('showPassword').addEventListener('click', () => {
      togglePasswordVisibility('password', 'showPassword');
    });

    document.getElementById('showConfirmPassword').addEventListener('click', () => {
        togglePasswordVisibility('confirmPassword', 'showConfirmPassword');
    });

}); // Espera a que el DOM esté completamente cargado

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  const mensajeElemento = document.getElementById('mensaje');
  mensajeElemento.textContent = texto;
  mensajeElemento.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'}`;
  mensajeElemento.style.display = 'block';
  
  // Ocultar mensaje después de 5 segundos
  setTimeout(() => {
    mensajeElemento.style.display = 'none';
  }, 5000);
}

// Función para mostrar/ocultar contraseña
function togglePasswordVisibility(inputId, buttonId) {
    // Obtiene el elemento de input de contraseña del DOM
    const input = document.getElementById(inputId);
    // Obtiene el elemento del botón (tag <button>) dentro del DOM
    const button = document.getElementById(buttonId);
    // Obtiene el elemento del ícono (tag <i>) dentro del botón
    const icon = button.querySelector('i');

    // Verifica si el input está actualmente en modo contraseña (oculto)
    if (input.type === 'password') {
        // Cambia a texto visible
        input.type = 'text';
        // Cambia el ícono a "ojo tachado" (indicando que la contraseña es visible)
        icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        // Vuelve a modo contraseña (oculto)
        input.type = 'password';
        // Cambia el ícono a "ojo abierto" (indicando que la contraseña está oculta)
        icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
}