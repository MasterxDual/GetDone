requireAuth();

/**
 * @constant DIR
 * @description URL base para las peticiones a la API de grupos
 * @type {string}
 */
const DIR = 'http://localhost:3000/api/groups';

/**
 * @function loadGroups
 * @description Carga y muestra la lista de grupos del usuario desde la API
 * @async
 * @returns {void}
 * 
 * Comportamiento:
 * 1. Obtiene el token de autenticación del localStorage
 * 2. Realiza una petición GET a la API para obtener los grupos
 * 3. Limpia y reconstruye la lista de grupos en el DOM
 * 4. Configura los event listeners para los botones de visualización
 * 5. Redirige a diferentes vistas según el rol del usuario (admin/miembro)
 * 
 * Manejo de errores:
 * - Captura y registra errores en la consola
 * - No muestra alertas al usuario para evitar interrupciones
 */
async function loadGroups() {
    try {
        // 1. Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // 2. Petición a la API para obtener grupos
        const response = await fetch(DIR, {
            headers: {
                'Authorization': `Bearer ${token}` // Autenticación Bearer
            }
        });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const groups = await response.json();

        // 3. Renderizar lista de grupos
        const list = document.getElementById('groupList');
        list.innerHTML = ''; // Limpiar lista existente
        
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
            list.innerHTML += html; // Agregar cada grupo a la lista
        });
        
        // 4. Configurar event listeners para los botones
        document.querySelectorAll('.view-group-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Obtener datos del grupo desde los atributos del botón
                const groupId = this.getAttribute('data-group-id');
                const role = this.getAttribute('data-role');
                
                // Almacenar datos en localStorage para uso posterior
                localStorage.setItem('selectedGroupId', groupId);
                localStorage.setItem('selectedGroupRole', role);
                
                // 5. Redirigir según el rol del usuario
                if (role === 'admin') {
                    window.location.href = '/views/admin/group-admin.html?groupId=' + groupId;
                } else {
                    window.location.href = '/views/user/group-member.html?groupId=' + groupId;
                }
            });
        });
    } catch (error) {
        console.error("Error loading groups:", error);
        // Considerar agregar feedback visual al usuario en caso de error
    }
}

/**
 * @function goToCreateGroup
 * @description Redirige a la página de creación de grupos
 * @returns {void}
 * 
 * Comportamiento:
 * - Navega a la página create-group.html
 * - No requiere parámetros ni retorna valores
 */
function goToCreateGroup() {
    window.location.href = "create-group.html";
}

/**
 * Inicialización de la página
 * @description Configura:
 * 1. Carga inicial de grupos al cargar la ventana
 * 
 * Consideraciones:
 * - No maneja casos donde el token no existe
 * - No verifica si el elemento groupList existe antes de usarlo
 */
window.onload = loadGroups;
