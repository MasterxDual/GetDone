requireAuth();

/**
 * @constant DIR
 * @description URL base para las peticiones a la API de grupos
 * @type {string}
 */
const DIR = 'http://localhost:3000/api/groups';

// Variables de paginacion
let currentPage = 1; // Página actual
let totalPages = 1; // Total de páginas
const PAGE_LIMIT = 5; // Número de grupos por página

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
async function loadGroups(page = 1) {
    try {
        // 1. Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // 2. Petición a la API para obtener grupos con parametros de paginacion
        const response = await fetch(`${DIR}?page=${page}&limit=${PAGE_LIMIT}`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Autenticación Bearer
            }
        });
        // const response = await fetch(DIR, {
        //     headers: {
        //         'Authorization': `Bearer ${token}` // Autenticación Bearer
        //     }
        // });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Debug: Verificar la respuesta del backend
        console.log('Respuesta de backend:', data);
        
        
        // data.groups es el array de grupos, data.totalPages es el total de páginas
        const groups = data.groups || [];

        totalPages = data.totalPages || 1;
        currentPage = data.page || 1;

        // --- NUEVO: Filtrar por groupId si viene en la URL ---
        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('groupId');

        let filteredGroups = groups;
        
        if (groupId) {
            filteredGroups = groups.filter(group => String(group.id) === String(groupId));
        }

        // 3. Renderizar lista de grupos
        const list = document.getElementById('groupList');
        list.innerHTML = ''; // Limpiar lista existente
        
        if(filteredGroups.length === 0) {
            list.innerHTML = `<div class="alert alert-info">No se encontró el grupo solicitado.</div>`;
        } else {
            filteredGroups.forEach(group => {
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
        }
        
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

        // 5. Renderizar controles de paginación
        renderPaginationControls(currentPage, totalPages, loadGroups);
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

// // Controles para la paginacion
// function renderPaginationControls(currentPage, totalPages) {
//     const paginationContainer = document.getElementById('paginationControls');
//     paginationContainer.innerHTML = '';

//     if (totalPages <= 1) return;

//     // Botón "Anterior" con icono
//     const prevButton = document.createElement('button');
//     prevButton.className = "btn btn-outline-primary mx-1";
//     prevButton.innerHTML = `<i class="bi bi-chevron-left"></i>`;
//     prevButton.disabled = currentPage === 1;
//     prevButton.onclick = () => loadGroups(currentPage - 1);
//     paginationContainer.appendChild(prevButton);

//     // Números de página
//     for (let i = 1; i <= totalPages; i++) {
//         const pageButton = document.createElement('button');
//         // Página actual: color celeste (btn-info), no clickeable
//         if (i === currentPage) {
//             pageButton.className = `btn btn-primary mx-1`;
//             pageButton.textContent = i;
//             pageButton.disabled = false;
//         } else {
//             pageButton.className = `btn btn-primary mx-1`;
//             pageButton.textContent = i;
//             pageButton.disabled = true;
//             pageButton.onclick = () => loadGroups(i);
//         }
//         paginationContainer.appendChild(pageButton);
//     }

//     // Botón "Siguiente" con icono
//     const nextButton = document.createElement('button');
//     nextButton.className = "btn btn-outline-primary mx-1";
//     nextButton.innerHTML = `<i class="bi bi-chevron-right"></i>`;
//     nextButton.disabled = currentPage === totalPages;
//     nextButton.onclick = () => loadGroups(currentPage + 1);
//     paginationContainer.appendChild(nextButton);
// }

/**
 * 
 */
window.addEventListener('DOMContentLoaded', () => {
    loadGroups();
});
