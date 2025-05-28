async function loadGroupInfo() {
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const group = await res.json();

        // Guarda el rol del usuario en el grupo (admin)
        localStorage.setItem('selectedGroupRole', group.role);

        document.getElementById('groupName').textContent = group.name;
        document.getElementById('groupDescription').textContent = group.description;
        document.getElementById('inviteCode').textContent = group.inviteCode;

        // Cargar integrantes del grupo para el administrador
        await loadGroupMembers(groupId, token);

        // Refrescar la lista de integrantes cada 10 segundos
        if (!window.groupMembersInterval) {
            window.groupMembersInterval = setInterval(() => {
                loadGroupMembers(groupId, token);
            }, 10000);
        }

        // para cargar las tareas del grupo existe otro script

    } catch (error) {
        alert('Error al cargar la información del grupo');
        console.error(error);
    }
}

async function loadGroupMembers(groupId, token) {
    try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            throw new Error('No autorizado o error al obtener miembros');
        }
        const members = await res.json();

        const membersList = document.getElementById('membersList');
        if (!membersList) {
            console.error('Elemento membersList no encontrado en el DOM');
            return;
        }
        membersList.innerHTML = ''; // Limpiar lista previa

        members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${member.name} (${member.email}) - Rol: ${member.role}`;
            membersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar integrantes:', error);
    }
}

// Copiar código de invitación al portapapeles
document.addEventListener('DOMContentLoaded', () => {
    loadGroupInfo();

    const copyBtn = document.getElementById('copyInviteCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const code = document.getElementById('inviteCode').textContent;
            navigator.clipboard.writeText(code)
                .then(() => alert('Código copiado al portapapeles'))
                .catch(() => alert('No se pudo copiar el código'));
        });
    }

    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('inviteEmail').value;
            const groupId = localStorage.getItem('selectedGroupId');
            const token = localStorage.getItem('token');

            if (!email || !groupId || !token) {
                alert('Faltan datos para enviar la invitación.');
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

                if (!res.ok) {
                    const errorData = await res.json();
                    alert('Error al enviar invitación: ' + (errorData.message || res.statusText));
                    return;
                }

                alert('Invitación enviada correctamente a ' + email);
                document.getElementById('inviteEmail').value = '';
            } catch (error) {
                alert('Error al enviar invitación');
                console.error(error);
            }
        });
    }
});
