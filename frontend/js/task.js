// Función para cargar los usuarios del grupo y poblar el select
async function loadGroupUsers() {
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            throw new Error('Error al obtener los miembros del grupo');
        }
        const members = await res.json();
        const select = document.getElementById('usuario_id');
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

document.addEventListener('DOMContentLoaded', () => {
    loadGroupUsers();

    document.getElementById('formTarea').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const groupId = localStorage.getItem('selectedGroupId');
        const token = localStorage.getItem('token');
        if (!groupId || !token) {
            alert('No se encontró información del grupo o usuario.');
            window.location.href = '/views/user/home.html';
            return;
        }

        const formData = {
            title: form.titulo.value,
            description: form.descripcion.value,
            delivery_date: form.fecha_entrega.value,
            priority: form.prioridad.value,
            groupId: groupId,
            assignedTo: form.usuario_id.value
        };

        console.log('Datos enviados:', formData);

        try {
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

            alert('Tarea creada exitosamente!');
            window.location.replace(document.referrer); // Recarga la pagina anterior
        } catch (error) {
            console.error('Error al crear tarea:', error);
            alert(`Error: ${error.message}`);
        }
    });
});
