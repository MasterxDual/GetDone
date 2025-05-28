document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('joinGroupForm');
    const messageDiv = document.getElementById('message');
    const token = localStorage.getItem('token');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inviteCode = document.getElementById('inviteCodeInput').value.trim();

        if (!inviteCode) {
            messageDiv.textContent = 'Por favor ingresa un código de invitación.';
            messageDiv.className = 'text-danger';
            return;
        }

        if (!token) {
            messageDiv.textContent = 'No estás autenticado. Por favor inicia sesión.';
            messageDiv.className = 'text-danger';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inviteCode })
            });

            if (!res.ok) {
                const errorData = await res.json();
                messageDiv.textContent = errorData.message || 'Error al unirse al grupo.';
                messageDiv.className = 'text-danger';
                return;
            }

            messageDiv.textContent = '¡Te has unido al grupo correctamente!';
            messageDiv.className = 'text-success';

            // Opcional: redirigir a la página principal o del grupo
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);

        } catch (error) {
            messageDiv.textContent = 'Error de red al intentar unirse al grupo.';
            messageDiv.className = 'text-danger';
            console.error(error);
        }
    });
});

function goToCreateGroup() {
    window.location.href = "create-group.html";
}