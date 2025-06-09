requireAuth();

async function loadTasks() {
    try {
      const token = localStorage.getItem('token');
      const groupId = localStorage.getItem('selectedGroupId');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('selectedGroupRole'); // Obtengo el rol

      if (!groupId || !userId) {
          alert('No se encontró el grupo actual o el usuario.');
          return;
      }

      let url = `http://localhost:3000/api/tasks?groupId=${groupId}`;
      // Si NO es admin, filtra por usuario asignado
      if (role !== 'admin') {
        url += `&assignedTo=${userId}`;
      }

      const res = await fetch(url, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      const tasks = await res.json();
      const list = document.getElementById('taskList');
      list.innerHTML = '';

      for (const task of tasks) {
        // Obtener comentarios de la tarea
        const commentsRes = await fetch(`http://localhost:3000/api/tasks/${task.id}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const comments = await commentsRes.json();

        // Construir HTML de comentarios
        let commentsHtml = '<div class="comments-section"><h6>Comentarios:</h6>';
        for (const comment of comments) {
          commentsHtml += `<p><strong>Usuario ${comment.userId}:</strong> ${comment.comment}</p>`;
        }
        commentsHtml += `
          <form onsubmit="addComment(event, ${task.id})">
            <input type="text" name="comment" placeholder="Agregar comentario" required>
            <button type="submit">Enviar</button>
          </form>
        </div>`;

        /* // Botón para marcar completada si no está completada
        let completeButton = '';
        if (task.status !== 'completada') {
          completeButton = `<button onclick="markComplete(${task.id})">Marcar como completada</button>`;
        } else {
          completeButton = `<span>Tarea completada</span>`;
        } */


        const completedClass = task.completed ? 'completed' : '';
      
        // Calcular si la tarea expira en 1 día o menos
        const today = new Date();
        const dueDate = new Date(task.delivery_date);
        const diffTime = dueDate.getTime() - today.setHours(0,0,0,0);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si falta 1 día o menos, aplicar clase de expiración
        const expClass = (diffDays <= 1 && diffDays >= 0 && !task.completed) ? 'expiring-soon' : '';

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
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTaskCompletion(${task.id}, this)">
                  <span class="status-box ${expClass}" id="taskExpiration-${task.id}">
                    <i class="bi bi-calendar-event"></i> Exp: ${task.delivery_date}
                  </span>
                </div>
              </div>
              <div class="ms-3">
                <div class="dropdown">
                  <button class="btn btn-light btn-sm" type="button" id="dropdownMenuButton${task.id}"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${task.id}">
                    <li><a class="dropdown-item" href="#" onclick="editTask(${task.id})">Editar</a></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask()">Eliminar</a></li>
                  </ul>
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
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
}

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

async function toggleTaskCompletion(taskId, checkbox) {
  const isCompleted = checkbox.checked; // Obtener el estado del checkbox
  const expirationElement = document.getElementById(`taskExpiration-${taskId}`);

  // Cambiar el color del contenedor de la fecha de expiración
  if (isCompleted) {
    expirationElement.classList.remove('expiring-soon'); // Quita el rojo si está presente
    expirationElement.classList.add('bg-success'); // Agrega el verde
  } else {
    expirationElement.classList.remove('bg-success'); // Quita el verde

    // Reaplica el rojo si la tarea está por vencer
    const today = new Date();
    const dueDate = new Date(expirationElement.textContent.split(': ')[1]); // Extrae la fecha
    const diffTime = dueDate.getTime() - today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && diffDays >= 0) {
      expirationElement.classList.add('expiring-soon'); // Vuelve a agregar el rojo
    }
  }

  // Enviar la actualización al backend
  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: isCompleted }) // Enviar el estado como JSON
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el estado de la tarea');
    }

    const data = await res.json();
    console.log('Tarea actualizada:', data);
  } catch (error) {
    console.error(error);
    alert('No se pudo actualizar el estado de la tarea.');
  }
}

async function editTask(id) {
const newDescription = prompt("Nueva descripción de la tarea:"); //Recibe la nueva descripción de la tarea

if (!newDescription) return;

const newDate = prompt("Nueva fecha de vencimiento (YYYY-MM-DD):"); //Recibe la nueva fecha de vencimiento

//Valida que la fecha tenga el formato correcto
if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
  alert("Fecha inválida. Debe tener el formato YYYY-MM-DD.");
  return;
}

try {
  const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { // Se utiliza para que el frontend se comunique con el backend o con cualquier API.
    method: 'PUT', // Método HTTP para actualizar
    headers: { 'Content-Type': 'application/json' }, // Indica que el cuerpo de la petición es JSON
    body: JSON.stringify({ // Se encarga de enviar datos al servidor en formato JSON.
      description: newDescription,
      delivery_date: newDate
    })
  });

  const data = await res.json(); //Espera a que el servidor responda y convierte ese JSON en un objeto usable en JavaScript

  if (res.ok) {
    alert(data.mensaje); // Muestra en pantalla el mensaje que devolvió el backend ("Tarea actualizada correctamente")
    loadTasks(); // Refrescar la lista dinámicamente
  } else {
    alert("Error: " + data.error);
  }

} catch (error) {
  console.error(error);
  alert("Error al actualizar la tarea.");
}
}


/* async function markComplete(taskId) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      alert('Error al marcar completada: ' + (data.message || 'Error desconocido'));
      return;
    }

    loadTasks(); // Recargar tareas para actualizar estado
  } catch (error) {
    console.error('Error marcando completada:', error);
  }
} */

// Función para cargar tareas
function goToCreateTask() {
    window.location.href = "task.html";
}

// Llamamos la función al cargar la página
window.onload = loadTasks;
