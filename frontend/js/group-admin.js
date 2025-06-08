/**
 * @function loadGroupInfo
 * @description Carga y muestra la información de un grupo específico y sus miembros
 * @async
 * @returns {void}
 * 
 * Comportamiento:
 * 1. Obtiene el ID del grupo y token del localStorage
 * 2. Redirige si falta información esencial
 * 3. Realiza una petición GET al endpoint de grupos
 * 4. Actualiza la UI con los datos del grupo
 * 5. Inicia la carga de miembros y establece un intervalo de refresco
 * 
 * Manejo de errores:
 * - Muestra alertas para errores críticos
 * - Redirige a la página principal si no hay datos esenciales
 */
async function loadGroupInfo() {
    // 1. Obtener datos esenciales del almacenamiento local
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    
    // 2. Validación básica de seguridad
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }

    try {
        // 3. Petición para obtener datos del grupo
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const group = await res.json();

        // 4. Almacenamiento y actualización de UI
        localStorage.setItem('selectedGroupRole', group.role); // Guardar rol para permisos
        
        // Actualizar elementos DOM
        document.getElementById('groupName').textContent = group.name;
        document.getElementById('groupDescription').textContent = group.description;
        document.getElementById('inviteCode').textContent = group.inviteCode;

        // 5. Carga inicial de miembros
        await loadGroupMembers(groupId, token);

        // 6. Configurar refresco periódico (solo si no existe)
        if (!window.groupMembersInterval) {
            window.groupMembersInterval = setInterval(() => {
                loadGroupMembers(groupId, token);
            }, 10000); // Refresco cada 10 segundos
        }

    } catch (error) {
        console.error('Error en loadGroupInfo:', error);
        alert('Error al cargar la información del grupo');
        // Considerar: window.location.href = '/views/error.html';
    }
}

/**
 * @function loadGroupMembers
 * @description Carga y muestra la lista de miembros de un grupo
 * @async
 * @param {string} groupId - ID del grupo
 * @param {string} token - Token de autenticación
 * @returns {void}
 * 
 * Comportamiento:
 * 1. Realiza petición GET al endpoint de miembros
 * 2. Limpia y reconstruye la lista en el DOM
 * 3. Muestra cada miembro con su nombre, email y rol
 * 
 * Consideraciones:
 * - Maneja errores silenciosamente (solo log a consola)
 * - Verifica existencia del contenedor DOM
 */
async function loadGroupMembers(groupId, token) {
    try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('No autorizado o error al obtener miembros');
        
        const members = await res.json();
        const membersList = document.getElementById('membersList');
        
        // Validar existencia del elemento contenedor
        if (!membersList) {
            console.error('Elemento membersList no encontrado en el DOM');
            return;
        }

        // Limpiar y reconstruir lista
        membersList.innerHTML = '';
        
        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${member.name} <small class="text-muted">(${member.email})</small></span>
                <span class="badge ${member.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">
                    ${member.role}
                </span>
            `;
            membersList.appendChild(li);
        });

    } catch (error) {
        console.error('Error en loadGroupMembers:', error);
        // No mostrar alerta para evitar spam en el intervalo
    }
}

/**
 * Inicialización después de la carga del DOM
 * Configura:
 * 1. Carga inicial de información del grupo
 * 2. Manejador para copiar código de invitación
 * 3. Manejador para el formulario de invitación
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial
    loadGroupInfo();

    // 2. Manejador de copia de código
    const copyBtn = document.getElementById('copyInviteCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const code = document.getElementById('inviteCode').textContent;
            try {
                await navigator.clipboard.writeText(code);
                // Mejorar feedback visual (ej. tooltip)
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="bi bi-check"></i> Copiado!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            } catch (err) {
                console.error('Error al copiar:', err);
                alert('No se pudo copiar el código');
            }
        });
    }

    // 3. Manejador de envío de invitaciones
    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('inviteEmail').value.trim();
            const groupId = localStorage.getItem('selectedGroupId');
            const token = localStorage.getItem('token');

            // Validación mejorada
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                alert('Por favor ingrese un email válido');
                return;
            }

            if (!groupId || !token) {
                alert('Sesión inválida. Por favor recargue la página.');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/groups/invite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ groupId, email })
                });

                const responseData = await res.json();
                
                if (!res.ok) {
                    throw new Error(responseData.message || 'Error desconocido');
                }

                // Feedback
                const emailInput = document.getElementById('inviteEmail');
                emailInput.value = '';
                emailInput.focus();
                
                showAlert('success', `Invitación enviada a ${email}`, 3000);
                
            } catch (error) {
                console.error('Error en invitación:', error);
                showAlert('danger', error.message || 'Error al enviar invitación', 5000);
            }
        });
    }
});

// Función auxiliar para mostrar alertas estilizadas
function showAlert(type, message, duration) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed-top mx-auto mt-3 w-50`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, duration);
}