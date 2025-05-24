/**
 *  TO-DO:
 *  Redirigir al login
 */
function logout() {
      window.location.href = "../views/auth/login.html";
    }


/**
 *  Actualizar lista de tareas, solicita al backend un JSON desde
 *  http://localhost:3000/tasks con los siguientes campos por cada tarea:
 *  [
 *    {
 *      "title": string,         // Título de la tarea
 *      "description": string,   // Descripción breve
 *      "priority": string,      // Prioridad (por ejemplo: 'Alta', 'Media', 'Baja')
 *      "due_date": string       // Fecha de vencimiento en formato 'YYYY-MM-DD'
 *    },
 *    ...
 *  ]
 *
 *  La función limpia el contenido actual del contenedor con id 'taskList'
 *  y agrega dinámicamente los elementos correspondientes a cada tarea recibida.
 */
async function loadTasks() {
    try {
      const res = await fetch('http://localhost:3000/api/tasks');
      // const res = await fetch('/api/tasks'); //Antes estaba: http://localhost:3000/tasks --> Error, front se debe comunicar con back a través de la API
      const tasks = await res.json(); //Espera a que el servidor responda y convierte ese JSON en un objeto usable en JavaScript, guardandolo en la variable tasks
      const list = document.getElementById('taskList'); //Trae la lista de tareas del HTML

      list.innerHTML = ''; // limpiamos antes de agregar

      tasks.forEach(task => {
        const html = `
          <div class="row align-items-center task-item">
            <div class="col-auto">
              <img src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" alt="Task Icon" class="task-img">
            </div>

            <div class="col">
              <h5 class="mb-0">${task.title}</h5>
              <p class="text-muted mb-0">${task.description}</p> 
            </div>

            <div class="col-auto task-meta">
              <!-- d-flex: ponemos los elementos uno al lado del otro
              gap-2: separacion entre el boton y el texto -->
              <div class="d-flex align-items-start gap-2">
                <!-- Botón de opciones con menú desplegable -->
                <div class="dropdown text-end mt-2">

                <button class="btn btn-light btn-sm" type="button" id="dropdownMenuButton"
                data-bs-toggle="dropdown" aria-expanded="false">
                <!-- Añade los tres puntos al botón -->
                <i class="bi bi-three-dots-vertical"></i> 
                </button>

                <!-- Añade un desplegable con opciones que se abre cuando clickeamos los tres puntos -->
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li><a class="dropdown-item" href="#" onclick="editTask(${task.id})">Editar</a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask()">Eliminar</a></li>
                </ul>

              </div>

              <!-- Mostramos la prioridad y la expiración -->
              <div>
                <strong>Prioridad: ${task.priority}</strong><br>
                <span class="text-muted">Exp: ${task.delivery_date}</span>
              </div>

            </div>
          </div>
        `;
        list.innerHTML += html; //Carga dinámicamente el HTML de cada tarea en la lista del frontend
      });
    } catch (error) {
      console.error('Error cargando tareas:', error);
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
    const res = await fetch(`/api/tasks/${id}`, { // Se utiliza para que el frontend se comunique con el backend o con cualquier API.
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

/**
 * TO-DO:
 * Redireccion a creacion de tareas
 */
function goToCreateTask() {
    window.location.href = "tasks.html";
  }

  // Llamamos la función al cargar la página
  window.onload = loadTasks;