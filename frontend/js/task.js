requireAuth();

/**
 * @function loadGroupUsers
 * @description Carga los miembros de un grupo y los muestra en un elemento select
 * @async
 * @returns {void}
 * 
 * Comportamiento:
 * 1. Obtiene el ID del grupo y token del localStorage
 * 2. Valida la existencia de credenciales
 * 3. Realiza petición GET al endpoint de miembros del grupo
 * 4. Pobla el select con los miembros obtenidos
 * 
 * Manejo de errores:
 * - Redirige si no hay credenciales
 * - Muestra alertas para errores de API
 */
async function loadGroupUsers() {
    // 1. Obtener credenciales necesarias
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    
    // 2. Validación de seguridad
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }

    try {
        // 3. Petición a la API
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error('Error al obtener los miembros del grupo');
        }

        const members = await res.json();
        const select = document.getElementById('usuario_id');
        
        // 4. Construir opciones del select
        select.innerHTML = '<option value="">Seleccionar usuario</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.userId;
            option.textContent = member.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error cargando usuarios del grupo:', error);
        alert('No se pudieron cargar los usuarios del grupo');
    }
}

/**
 * @event DOMContentLoaded
 * @description Configuración inicial cuando el DOM está listo
 * 
 * Comportamiento:
 * 1. Carga los usuarios del grupo
 * 2. Configura el event listener para el formulario de tareas
 * 3. Valida y envía los datos de la nueva tarea
 * 4. Maneja la respuesta del servidor
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial de usuarios
    loadGroupUsers();

    // 2. Configurar formulario de tareas
    document.getElementById('formTarea').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;

        // 3. Validación del formulario
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Verificar credenciales
        const groupId = localStorage.getItem('selectedGroupId');
        const token = localStorage.getItem('token');
        if (!groupId || !token) {
            alert('No se encontró información del grupo o usuario.');
            window.location.href = '/views/user/home.html';
            return;
        }

        // Preparar datos del formulario
        const formData = {
            title: form.titulo.value,
            description: form.descripcion.value,
            delivery_date: form.fecha_entrega.value,
            priority: form.prioridad.value,
            groupId: groupId,
            assignedTo: form.usuario_id.value,
            status: 'pending'
        };

        console.log('Datos enviados:', formData);

        try {
            // 4. Enviar tarea al servidor
            const res = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al crear tarea');
            }

            // Éxito: mostrar feedback y redirigir
            alert('Tarea creada exitosamente!');
            window.location.replace(document.referrer);

        } catch (error) {
            console.error('Error al crear tarea:', error);
            alert(`Error: ${error.message}`);
        }
    });
});
