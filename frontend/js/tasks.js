// Este archivo contiene los controladores para manejar las tareas

// Escucha el evento 'submit' del formulario con id 'formTarea'
document.getElementById('formTarea').addEventListener('submit', async (e) => {
    // Previene el comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();

    // Obtiene el elemento formulario que disparó el evento
    const form = e.target;

    // Valida el formulario usando la API de validacion HTML5
    if (!form.checkValidity()) {
        // Si el formulario no es válido, muestra los mensajes de error (con Bootstrap) y sale
        form.classList.add('was-validated');
        return;
    }

    try {
        // Prepara un objeto con los datos del formulario
        const formData = {
            title: form.title.value,
            description: form.description.value,
            delivery_date: form.delivery_date.value, // Ya está en formato YYYY-MM-DD
            priority: form.priority.value
        };

        // Debug: muestra los datos que se enviarán
        console.log('Enviando datos:', formData);

        // Realiza la peticion fetch al endpoint del backend
        const response = await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData) // Convierte el objeto a JSON
        });

        // Debug: muestra la respuesta cruda
        console.log('Respuesta recibida:', response);

        // Convierte la repuesta a JSON
        const data = await response.json();

        // Si la respuesta no fue exitosa
        if (!response.ok) {
            console.error('Error del servidor:', data);
            // Lanza un mensaje de error del servidor o uno por defecto
            throw new Error(data.error || 'Error al crear tarea');
        }

        // Si la respuesta fue exitosa, muestra un mensaje de éxito
        console.log('Tarea creada:', data);
        alert('Tarea creada exitosamente!');

        // Redirecciona a la lista de tareas
        window.location.href = 'tasklist.html';

    } catch (error) {
        console.error('Error completo:', error);
        alert(`Error: ${error.message}`);
    }
});



/* Implementacion Deprecada: */

// document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('formTarea').addEventListener('submit', function (e) {
//         // Prevenimos el comportamiento por defecto del formulario (que recarga la página)
//         e.preventDefault();

//         // Creamos un objeto FormData con los datos del formulario actual
//         const formData = new FormData(this);

//         // Convertimos ese FormData en un objeto plano de JavaScript (clave: valor)
//         const data = Object.fromEntries(formData.entries());

//         // Usamos fetch para enviar una petición HTTP POST al backend con los datos del formulario
//         fetch('/api/tasks', {
//             method: 'POST', // Método HTTP: crear recurso
//             headers: { 'Content-Type': 'application/json' }, // Indicamos que el cuerpo es JSON
//             body: JSON.stringify(data) // Convertimos los datos a formato JSON
//         })
//         // Cuando recibimos respuesta, la convertimos a JSON y mostramos un mensaje de éxito
//         .then(res => res.json())
//         .then(res => alert('Tarea creada correctamente'))
//         // Si ocurre un error en la solicitud, mostramos un mensaje de error al usuario
//         .catch(err => alert('Error al crear tarea'));
//     })
// });

/*¿Qué hace este código en resumen?

--> Intercepta el envío del formulario
--> Lee los datos del usuario (title, description, priority, etc.)
--> Los convierte a JSON
--> Los envía al backend Express (/api/tasks)
--> Muestra un mensaje al usuario según la respuesta */
