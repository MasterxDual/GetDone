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
                const isAdmin = group.role === 'admin';
                
                const html = `
                <div class="card mb-3 shadow-sm border-0">
                  <div class="card-body position-relative">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 class="card-title mb-1">${group.name}</h5>
                        <p class="card-text text-muted mb-3">${group.description}</p>
                        <button 
                            class="btn btn-primary view-group-btn" 
                            data-group-id="${group.id}" 
                            data-role="${group.role}">
                            View Group
                        </button>
                      </div>
                      ${isAdmin ? `
                      <div class="dropdown ms-2">
                        <button class="btn btn-light btn-sm" type="button" id="groupDropdown${group.id}"
                          data-bs-toggle="dropdown" aria-expanded="false" style="position: absolute; top: 0; right: 0;">
                          <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="groupDropdown${group.id}">
                          <li><a class="dropdown-item" href="#" onclick="openEditGroupModal(${group.id}, '${group.name.replace(/'/g, "\\'")}', '${group.description.replace(/'/g, "\\'")}')">Editar</a></li>
                          <li><a class="dropdown-item text-danger" href="#" onclick="deleteGroup(${group.id})">Eliminar</a></li>
                        </ul>
                      </div>
                      ` : ''}
                    </div>
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

/**
 * Abre el modal de edición de grupo y precarga los datos del grupo seleccionado.
 *
 * Esta función asigna los valores del grupo (ID, nombre y descripción) a los campos
 * correspondientes dentro del formulario del modal y luego muestra el modal utilizando Bootstrap.
 *
 * @function openEditGroupModal
 * @param {number|string} id - ID del grupo a editar.
 * @param {string} name - Nombre actual del grupo.
 * @param {string} description - Descripción actual del grupo.
 *
 * @example
 * openEditGroupModal(1, 'Grupo de Estudio', 'Grupo para estudiar programación');
 */
function openEditGroupModal(id, name, description) {
  document.getElementById('editGroupId').value = id;
  document.getElementById('editGroupName').value = name;
  document.getElementById('editGroupDescription').value = description;
  var modal = new bootstrap.Modal(document.getElementById('editGroupModal'));
  modal.show();
}


/**
 * Elimina un grupo mediante una solicitud HTTP DELETE al backend.
 *
 * Esta función muestra una confirmación al usuario antes de proceder. 
 * Si el usuario confirma, se envía una solicitud autenticada para eliminar el grupo por su ID.
 * Tras la eliminación, recarga la lista de grupos con `loadGroups()`.
 *
 * @async
 * @function deleteGroup
 * @param {number|string} id - ID del grupo a eliminar.
 *
 * @returns {Promise<void>} No retorna valor directamente; muestra mensajes al usuario según el resultado.
 *
 * @example
 * deleteGroup(5); // Elimina el grupo con ID 5 si el usuario lo confirma.
 *
 * @throws Muestra alertas al usuario si ocurre un error en la solicitud o en la respuesta del servidor.
 */
async function deleteGroup(id) {
  if (!confirm('¿Está seguro que desea eliminar este grupo?')) {
    return;
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/groups/${id}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      alert('Error al eliminar el grupo: ' + (data.message || 'Error desconocido'));
      return;
    }

    alert('Grupo eliminado correctamente');
    loadGroups(); // Recargar lista de grupos
  } catch (error) {
    console.error('Error eliminando grupo:', error);
    alert('No se pudo eliminar el grupo.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
    // Carga la lista de grupos cuando se inicia la página.
    loadGroups();

    document.getElementById('editGroupForm')?.addEventListener('submit', async function(e) {
      // Previene el comportamiento por defecto del formulario (recarga de la página).
      e.preventDefault();

      const id = document.getElementById('editGroupId').value;
      const name = document.getElementById('editGroupName').value;
      const description = document.getElementById('editGroupDescription').value;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/groups/${id}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name, description })
        });
        if (res.ok) {
          // Recargar la lista o actualizar dinámicamente
          loadGroups();

          // Cierra el modal de edición utilizando la instancia Bootstrap ya abierta.
          var modal = bootstrap.Modal.getInstance(document.getElementById('editGroupModal'));
          modal.hide();
        } else {
          alert('Solo el admin puede editar el grupo.');
        }
      } catch (err) {
        alert('Error al editar el grupo.');
      }
    });
});
