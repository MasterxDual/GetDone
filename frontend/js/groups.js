document.getElementById('formGroup').addEventListener('submit', async function (e) {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    const form = e.target; // Obtiene el formulario que disparó el evento

    if (!form.checkValidity()) {
        form.classList.add('was-validated'); // Añade clase de Bootstrap para mostrar errores
        return; // Sale si el formulario no es válido
    }

    try {
        const formData = {
            name: form.groupName.value, // Obtiene el valor del campo 'name'
            description: form.groupDescription.value
        };

        const token = localStorage.getItem('token'); // Obtiene el token de autenticación del localStorage

        const response = await fetch('http://localhost:3000/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluye el token en la cabecera de autorización
            },
            body: JSON.stringify(formData) // Convierte el objeto a JSON
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear grupo');
        }

        const data = await response.json();
        console.log('Grupo creado:', data);
        alert('Grupo creado exitosamente!');
        window.location.href = 'home.html'; // Redirecciona a la lista de grupos

    } catch (error) {
        console.error('Error completo:', error);
        alert(`Error: ${error.message}`);
    }
});