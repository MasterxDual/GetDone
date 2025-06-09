requireAuth();

// Obtiene el formulario por su ID y añade un event listener para el evento 'submit'
document.getElementById('formGroup').addEventListener('submit', async function (e) {
    // Previene el comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();

    // Obtiene el formulario que disparó el evento
    const form = e.target;

    // Valida los campos del formulario usando la API de validación HTML5
    if (!form.checkValidity()) {
        // Añade la clase de Bootstrap para mostrar mensajes de validación
        form.classList.add('was-validated');
        return; // Detiene la ejecución si el formulario no es válido
    }

    try {
        // Prepara los datos del formulario para enviar a la API
        const formData = {
            name: form.groupName.value,     // Obtiene el valor del campo nombre
            description: form.groupDescription.value  // Obtiene el valor del campo descripción
        };

        // Obtiene el token JWT del localStorage para autenticación
        const token = localStorage.getItem('token');

        // Realiza la petición POST al endpoint de grupos
        const response = await fetch('http://localhost:3000/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Indica que envía datos JSON
                'Authorization': `Bearer ${token}`   // Incluye el token en el header
            },
            body: JSON.stringify(formData)  // Convierte el objeto a formato JSON
        });

        // Si la respuesta no es exitosa (status fuera del rango 200-299)
        if (!response.ok) {
            // Intenta parsear el mensaje de error de la respuesta
            const errorData = await response.json();
            // Lanza un error con el mensaje del servidor o uno por defecto
            throw new Error(errorData.message || 'Error al crear grupo');
        }

        // Parsea la respuesta JSON exitosa
        const data = await response.json();
        console.log('Grupo creado:', data);  // Log para desarrollo
        
        // Muestra alerta de éxito al usuario
        alert('Grupo creado exitosamente!');
        
        // Redirecciona a la página de listado de grupos
        window.location.href = 'home.html';

    } catch (error) {
        // Captura y maneja cualquier error ocurrido en el try
        console.error('Error completo:', error);  // Log detallado para desarrollo
        
        // Muestra al usuario el mensaje de error
        alert(`Error: ${error.message}`);
    }
});