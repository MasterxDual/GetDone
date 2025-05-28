const DIR = 'http://localhost:3000/api/groups';

async function loadGroups() {
    try {
        const token = localStorage.getItem('token'); // Obtiene el token de autenticación del localStorage

        // Realiza una solicitud GET a la API para obtener los grupos
        const response = await fetch(DIR, {
            headers: {
                'Authorization': `Bearer ${token}` // Incluye el token en la cabecera de autorización
            }
        });

        const groups = await response.json(); // Convierte la respuesta JSON en un objeto JavaScript

        const list = document.getElementById('groupList'); // Obtiene el elemento donde se mostrarán los grupos

        list.innerHTML = ''; // Limpia la lista antes de agregar nuevos grupos
        
        groups.forEach(group => {
            const html = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${group.name}</h5>
                        <p class="card-text">${group.description}</p>
                        <button 
                            class="btn btn-primary view-group-btn" 
                            data-group-id="${group.id}" 
                            data-role="${group.role}">
                            View Group
                        </button>
                    </div>
                </div>
            `;
            list.innerHTML += html;
        });
        
        // Después de renderizar los grupos:
        document.querySelectorAll('.view-group-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = this.getAttribute('data-group-id');
                const role = this.getAttribute('data-role');
                localStorage.setItem('selectedGroupId', groupId);
                localStorage.setItem('selectedGroupRole', role);
                
                // window.location.href = '../user/group.html';

                if (role === 'admin') {
                    window.location.href = '/views/admin/group-admin.html?groupId=' + groupId;
                } else {
                    window.location.href = '/views/user/group-member.html?groupId=' + groupId;
                }
            });
        });
    } catch (error) {
        console.error("Error loading groups:", error);
    }
}

function goToCreateGroup() {
    window.location.href = "create-group.html";
}

window.onload = loadGroups; // Carga los grupos al cargar la página
