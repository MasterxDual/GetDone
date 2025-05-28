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

        // Botón para marcar completada si no está completada
        let completeButton = '';
        if (task.status !== 'completada') {
          completeButton = `<button onclick="markComplete(${task.id})">Marcar como completada</button>`;
        } else {
          completeButton = `<span>Tarea completada</span>`;
        }

        const html = `
          <hr>
          <div class="row align-items-center task-item">
            <div class="col-auto">
              <i class="bi bi-list-check task-img" style="font-size: 2rem; color: #0d6efd;"></i>
            </div>
            <div class="col">
              <h5 class="mb-0">${task.title}</h5>
              <p class="text-muted mb-0">${task.description}</p>
              ${commentsHtml}
            </div>
            <div class="col-auto task-meta">
              <div class="d-flex align-items-start gap-2">
                <div class="dropdown text-end mt-2">
                  <button class="btn btn-light btn-sm" type="button" id="dropdownMenuButton"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><a class="dropdown-item" href="#" onclick="editTask(${task.id})">Editar</a></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask()">Eliminar</a></li>
                  </ul>
                </div>
                <div>
                  <strong>Prioridad: ${task.priority}</strong><br>
                  <span class="text-muted">Exp: ${task.delivery_date}</span><br>
                  ${completeButton}
                </div>
              </div>
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

async function markComplete(taskId) {
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
}

// Función para cargar tareas
function goToCreateTask() {
    window.location.href = "task.html";
}

// Llamamos la función al cargar la página
window.onload = loadTasks;
