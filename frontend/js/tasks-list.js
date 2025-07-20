
// Variables de paginacion
let currentPage = 1; // Página actual
let totalPages = 1; // Total de páginas
const PAGE_LIMIT = 5; // Número de grupos por página
let orderType = 'created_at'; // Por defecto, ordenar por fecha de creación

document.addEventListener('DOMContentLoaded', function() {
  requireAuth();
  const editForm = document.getElementById('editTaskForm')

  if(editForm) {
    editForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const taskId = document.getElementById('editTaskId').value;
      const description = document.getElementById('editTaskDescription').value;
      const delivery_date = document.getElementById('editTaskDate').value;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ description, delivery_date })
        });
        if (res.ok) {
          // Puedes recargar la vista o actualizar dinámicamente
          location.reload(); // O tu lógica de render
        } else {
          alert('Solo el admin puede editar la tarea.');
        }
      } catch (err) {
        alert('Error al editar la tarea.');
      }
    });
  }

  document.getElementById('toggleOrderBtn').addEventListener('click', function() {
        if (orderType === 'created_at') {
          orderType = 'delivery_date';
          this.innerHTML = '<i class="bi bi-calendar2-week"></i> Orden: Vencimiento';
        } else {
          orderType = 'created_at';
          this.innerHTML = '<i class="bi bi-sort-down"></i> Orden: Creación';
        }
        // Vuelve a cargar la paginación con el nuevo orden
        loadTasks(1, orderType);
  });
});

/**
 * Carga y renderiza la lista de tareas del grupo seleccionado desde el backend.
 *
 * Esta función realiza las siguientes acciones:
 * - Obtiene el `groupId`, `userId`, `role` y `token` desde el almacenamiento local.
 * - Si hay un `taskId` en la URL, filtra los resultados para mostrar solo esa tarea.
 * - Construye la URL de la API en función del rol del usuario.
 * - Hace una solicitud `GET` a `/api/tasks`.
 * - Por cada tarea recibida:
 *    - Recupera los comentarios asociados.
 *    - Calcula el estado de expiración según la fecha de entrega.
 *    - Aplica estilos condicionales según prioridad, estado y rol.
 *    - Construye y agrega el HTML al DOM.
 *
 * También incluye lógica para:
 * - Mostrar mensaje si no se encuentra ninguna tarea.
 * - Mostrar el rol del usuario junto al comentario.
 * - Permitir a administradores editar o eliminar tareas.
 *
 * @async
 * @function
 * @returns {Promise<void>} No devuelve un valor, pero modifica el DOM con el contenido de tareas.
 */
async function loadTasks(page = 1, orderBy = 'created_at') {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('selectedGroupRole'); // Obtengo el rol
      
      // NUEVO: obtener taskId de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const taskIdParam = urlParams.get('taskId');
      const groupId = localStorage.getItem('selectedGroupId') || urlParams.get('groupId'); // Obtengo el groupId de localStorage o de la URL

      const params = new URLSearchParams({
        page,
        orderBy //created_at o delivery_date
      });
      
      console.log('Rol de usuario:', role);
      console.log('Grupo ID:', groupId);
      console.log('Usuario ID:', userId);

      if (!groupId || !userId) {
          alert('No se encontró el grupo actual o el usuario.');
          return;
      }

      let url = `http://localhost:3000/api/tasks?groupId=${groupId}`;
      // Si NO es admin, filtra por usuario asignado
      if (role !== 'admin') {
        url += `&assignedTo=${userId}`;
      }
      url += `&page=${page}&limit=${PAGE_LIMIT}&orderBy=${orderBy}`;

      console.log('URL para obtener tareas:', url);

      // Peticion a la API con paginación para obtener lista de tareas
      const res = await fetch(url, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });


      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en la respuesta de tareas:', res.status, errorText);
        alert('Error al cargar las tareas: ' + res.status);
        return;
      }

      const data = await res.json();

      let tasks = data.tareas || [];

      totalPages = data.pagination ? data.pagination.totalPages : 1;
      currentPage = data.pagination ? data.pagination.page : 1;

      // NUEVO: filtrar solo por el taskId si existe en la URL
      if (taskIdParam) {
        tasks = tasks.filter(task => String(task.id) === String(taskIdParam));
      }

      const list = document.getElementById('taskList');
      list.innerHTML = '';

      // NUEVO: si no hay tareas, mostrar mensaje
      if (tasks.length === 0) {
        list.innerHTML = `<div class="alert alert-info">No se encontró la tarea solicitada.</div>`;
        return;
      }

      for (const task of tasks) {
        // Obtener comentarios de la tarea
        const commentsRes = await fetch(`http://localhost:3000/api/tasks/${task.id}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!commentsRes.ok) {
          const errorText = await commentsRes.text();
          console.error('Error en la respuesta de comentarios:', commentsRes.status, errorText);
          alert('Error al cargar los comentarios: ' + commentsRes.status);
          return;
        }

        const comments = await commentsRes.json();

        // Construir HTML de comentarios
        let commentsHtml = '<div class="comments-section"><h6>Comentarios:</h6>';
        for (const comment of comments) {
          commentsHtml += `<p><strong>${comment.userName} (${comment.role === 'member' ? 'miembro' : comment.role}) :</strong> ${comment.comment}</p>`;
        }
        commentsHtml += `
          <form onsubmit="addComment(event, ${task.id})">
            <input type="text" name="comment" placeholder="Agregar comentario" required>
            <button type="submit">Enviar</button>
          </form>
        </div>`;

        const completedClass = task.completed ? 'completed' : '';
      
        // Calcular si la tarea expira en 1 día o menos
        const today = new Date();
        const dueDate = new Date(task.delivery_date);
        const diffTime = dueDate.getTime() - today.setHours(0,0,0,0);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si falta 1 día o menos, aplicar clase de expiración
        const expClass = task.status === 'completed' ? 'bg-success' : task.status === 'expiring-soon' ? 'expiring-soon' : '';

        // Asignar color de badge según prioridad
        const priorityColors = {
          'Alta': 'danger',
          'Media': 'warning',
          'Baja': 'success'
        };
        // Si la prioridad no está definida, usar 'secondary' como valor por defecto
        const priorityBadge = priorityColors[task.priority] || 'secondary';

        // Construir el HTML de la tarea
        const html = `
          <div class="card mb-3 shadow-sm border-0">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <i class="bi bi-list-check fs-2 text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-1">${task.title}</h5>
                  <span class="badge bg-${priorityBadge}">${task.priority}</span>
                </div>
                <p class="card-text text-muted mb-2">${task.description}</p>
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" class="form-check-input me-2" id="taskCheckbox-${task.id}" 
                    ${task.status === 'completed' ? 'checked' : ''} 
                    onchange="toggleTaskCompletion(${task.id}, this)" 
                    ${role !== 'admin' && role !== 'member' ? 'disabled' : ''} 
                    style="cursor: pointer;">
                  <span class="status-box ${expClass}" id="taskExpiration-${task.id}">
                    <i class="bi bi-calendar-event" ></i> Exp: ${task.delivery_date}
                  </span>
                </div>
              </div>
              <div class="ms-3">
                <div class="dropdown">
                  ${role === 'admin' ? `
                    <button class="btn btn-light btn-sm" type="button" id="dropdownMenuButton${task.id}"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${task.id}">
                      <li><a class="dropdown-item" href="#" onclick="openEditTaskModal(${task.id}, '${task.description.replace(/'/g, "\\'")}', '${task.delivery_date}')">Editar</a></li>
                      <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask(${task.id})">Eliminar</a></li>
                    </ul>
                    ` : ''}
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-0 pt-0">
              ${commentsHtml}
            </div>
          </div>
        `;
        list.innerHTML += html;
      }

      // Renderizar controles de paginación
      renderPaginationControls(currentPage, totalPages, loadTasks);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
}


/**
 * Envía un nuevo comentario asociado a una tarea específica al servidor.
 *
 * Esta función se ejecuta al enviar el formulario de comentario.
 * Realiza las siguientes acciones:
 * - Previene el comportamiento por defecto del formulario.
 * - Recupera el contenido del comentario y el token JWT desde localStorage.
 * - Realiza una solicitud POST a `/api/tasks/:taskId/comments` con el comentario.
 * - Si la solicitud es exitosa, limpia el formulario y recarga las tareas para reflejar el nuevo comentario.
 * - En caso de error, muestra un mensaje de alerta con la causa del fallo.
 *
 * @async
 * @function
 * @param {Event} event - El evento de envío del formulario.
 * @param {number} taskId - El ID de la tarea a la que se asocia el comentario.
 * @returns {Promise<void>} No retorna valor, pero actualiza el estado de la UI.
 */
async function addComment(event, taskId) {
  event.preventDefault();
  const form = event.target;
  const comment = form.comment.value;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment })
    });

    if (!res.ok) {
      const data = await res.json();
      alert('Error al agregar comentario: ' + (data.message || 'Error desconocido'));
      return;
    }

    form.reset();
    loadTasks(); // Recargar tareas para mostrar nuevo comentario
  } catch (error) {
    console.error('Error agregando comentario:', error);
  }
}

/**
 * Cambia el estado de completitud de una tarea tanto visualmente como en el backend.
 *
 * Si `forceComplete` es `true`, marca la tarea como completada sin importar el estado del checkbox.
 * Además, modifica visualmente la clase del contenedor de expiración y sincroniza el nuevo estado con la API.
 *
 * @async
 * @function toggleTaskCompletion
 * @param {number} taskId - ID único de la tarea a actualizar.
 * @param {HTMLInputElement} checkbox - Elemento checkbox asociado a la tarea.
 * @param {boolean} [forceComplete=false] - Si se establece en `true`, forzará que la tarea se marque como completada, ignorando el estado del checkbox.
 * @returns {Promise<void>} No retorna nada directamente, pero actualiza la UI y envía el cambio al servidor.
 *
 * @throws {Error} Si ocurre un error en la comunicación con el servidor o en la actualización del estado.
 *
 * @sideEffect Modifica el DOM para cambiar estilos visuales y puede recargar las tareas si fue activado por `forceComplete`.
 */
async function toggleTaskCompletion(taskId, checkbox, forceComplete = false) {
  // Si forceComplete es true, siempre marca como completada
  const isCompleted = forceComplete ? true : checkbox.checked;
  const expirationElement = document.getElementById(`taskExpiration-${taskId}`);

  // Cambiar el color del contenedor de la fecha de expiración
  if (isCompleted) {
    expirationElement.classList.remove('expiring-soon');
    expirationElement.classList.add('bg-success');
  } else {
    expirationElement.classList.remove('bg-success');
    // Reaplica el rojo si la tarea está por vencer
    const today = new Date();
    const dueDate = new Date(expirationElement.textContent.split(': ')[1]);
    const diffTime = dueDate.getTime() - today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1 && diffDays >= 0) {
      expirationElement.classList.add('expiring-soon');
    }
  }

  // Enviar la actualización al backend
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed: isCompleted,
        status: isCompleted ? 'completed' : 'pending'
      })
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el estado de la tarea');
    }

    const data = await res.json();
    console.log('Tarea actualizada:', data);

    // Opcional: recargar tareas si fue por el botón de expiración
    if (forceComplete) loadTasks();
  } catch (error) {
    console.error(error);
    alert('No se pudo actualizar el estado de la tarea.');
  }
}

/**
 * Abre un modal para editar una tarea, precargando sus datos actuales.
 *
 * Esta función configura los campos del formulario de edición con los valores
 * actuales de la tarea seleccionada (ID, descripción y fecha de entrega) y
 * luego muestra el modal utilizando Bootstrap.
 *
 * @function openEditTaskModal
 * @param {number|string} taskId - ID único de la tarea a editar.
 * @param {string} description - Descripción actual de la tarea.
 * @param {string} delivery_date - Fecha de entrega de la tarea en formato 'YYYY-MM-DD'.
 *
 * @example
 * openEditTaskModal(5, "Actualizar documentación", "2025-07-20");
 */
function openEditTaskModal(taskId, description, delivery_date) {
  document.getElementById('editTaskId').value = taskId;
  document.getElementById('editTaskDescription').value = description;
  document.getElementById('editTaskDate').value = delivery_date;
  var modal = new bootstrap.Modal(document.getElementById('editTaskModal'));

  modal.show();
}

/**
 * Elimina una tarea del backend tras confirmar la acción con el usuario.
 *
 * Realiza una solicitud HTTP DELETE a la API para eliminar la tarea correspondiente
 * al ID proporcionado. Requiere un token de autenticación guardado en localStorage.
 * Si la eliminación es exitosa, recarga la lista de tareas en la interfaz.
 *
 * @async
 * @function deleteTask
 * @param {number|string} id - ID de la tarea a eliminar.
 * @returns {Promise<void>} No retorna valor. Muestra alertas y actualiza la UI como efecto colateral.
 *
 * @throws {Error} Muestra errores en consola y alerta si la solicitud falla o la tarea no se puede eliminar.
 *
 * @sideEffect
 * - Muestra diálogos de confirmación y alerta al usuario.
 * - Ejecuta `loadTasks()` para actualizar la lista visual tras la eliminación.
 */
async function deleteTask(id) {
  if (!confirm('¿Está seguro que desea eliminar esta tarea?')) {
    return;
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      alert('Error al eliminar la tarea: ' + (data.message || 'Error desconocido'));
      return;
    }

    alert('Tarea eliminada correctamente');
    loadTasks(); // Recargar lista de tareas
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    alert('No se pudo eliminar la tarea.');
  }
}

// Función para cargar tareas
function goToCreateTask() {
    window.location.href = "task.html";
}

// Llamamos la función al cargar la página
// window.onload = loadTasks;

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});