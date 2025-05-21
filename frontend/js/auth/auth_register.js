

/**
 * Inicializa el formulario de registro
 */
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar el formulario de Registro
    const form = document.getElementById('registerForm');

    // Escuchar el evento submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que se recargue la pagina al enviar el formulario

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
                window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
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