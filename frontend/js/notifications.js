/* Usamos polling para actualizar el contador de notificaciones
Polling:
--> Consiste en hacer una petición al backend cada cierto intervalo (por ejemplo, cada 30 segundos) para traer las notificaciones.
--> Es más simple de implementar y funciona en cualquier entorno.
#Ventaja: Fácil de implementar
#Desventaja: Puede haber un pequeño retraso y un consumo innecesario de recursos si hay muchos usuarios y peticiones. */

document.addEventListener('DOMContentLoaded', function() {
  updateNotificationBadge();
  setInterval(updateNotificationBadge, 30000);

  const bellIcon = document.getElementById('notificationBell');
  if (bellIcon) {
    bellIcon.addEventListener('click', async function(event) {
      event.preventDefault();
      event.stopPropagation();

      const dropdown = document.getElementById('notificationsDropdown');

      // Si el dropdown ya está visible, lo eliminamos (cerramos)
      if (dropdown) {
        dropdown.remove();
      } else {
        // Si no está visible, lo mostramos
        await showNotificationsDropdown(event);

        // Listener para cerrar el dropdown si se hace clic fuera
        document.addEventListener('click', function closeDropdown(e) {
          if (!e.target.closest('#notificationsDropdown') && !e.target.closest('.notification-icon-container')) {
            document.getElementById('notificationsDropdown')?.remove();
            document.removeEventListener('click', closeDropdown);
          }
        });
      }
    });
  }
});

async function showNotificationsDropdown(event) {
  event.preventDefault();
  event.stopPropagation();

  // Elimina dropdowns viejos si hay
  document.getElementById('notificationsDropdown')?.remove();

  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/notifications', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notifications = await res.json();
  

  // Construye el HTML del dropdown
  
  let html = '<div class="dropdown-menu show" id="notificationsDropdown" style="width:350px; max-height:400px; overflow:auto; right:0; top:100%; position:absolute; z-index:999;">';
  
  if (notifications.length === 0) {
    html += '<span class="dropdown-item-text">Sin notificaciones</span>';
  } else {
    notifications.forEach(n => {
      html += `<div class="dropdown-item${n.isRead ? '' : ' fw-bold'}" style="cursor: pointer" onclick="goToTaskFromNotification('${n.groupId}', '${n.taskId}', '${n.id}', '${n.role}')">
        <i class="bi bi-info-circle me-2"></i> ${n.message}
        <div class="text-muted small">${new Date(n.created_at).toLocaleString('es-AR', { 
          //Formato de 24 horas Argentina
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>`;
    });
    html += `
      <div class="dropdown-divider"></div>
      <div class=d-flex justify-content-between">
        <button class="dropdown-item text-primary" onclick="markAllNotificationsRead()">Marcar todas como leídas</button>
        <button class="dropdown-item text-danger" onclick="deleteAllNotifications()">Eliminar todas</button>
    `;
  }
  html += '</div>';

  // Borra otros dropdowns y muestra este
  const iconContainer = document.querySelector('.notification-icon-container');
  iconContainer.insertAdjacentHTML('beforeend', html);
}

// Marcar todas como leídas
async function markAllNotificationsRead() {
  const token = localStorage.getItem('token');
  await fetch('http://localhost:3000/api/notifications/markasread', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  updateNotificationBadge();
  document.getElementById('notificationsDropdown')?.remove();
}

async function updateNotificationBadge() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/notifications', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notifications = await res.json();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const badge = document.getElementById('notificationBadge');
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

/**
 * Elimina todas las notificaciones del usuario autenticado mediante una solicitud HTTP DELETE
 * al endpoint correspondiente. Luego actualiza el contador de notificaciones y cierra el menú desplegable.
 *
 * @async
 * @function deleteAllNotifications
 * @returns {Promise<void>} No retorna ningún valor, pero actualiza visualmente el contador de notificaciones
 * y elimina el dropdown del DOM si existe.
 */
async function deleteAllNotifications() {
  const token = localStorage.getItem('token');
  await fetch('http://localhost:3000/api/notifications/deleteall', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  updateNotificationBadge();
  document.getElementById('notificationsDropdown')?.remove();
}

/**
 * Marca una notificación como leída y redirige al usuario a la vista de la tarea correspondiente.
 *
 * Este flujo realiza tres acciones consecutivas:
 * 1. Llama a `markNotificationAsRead(notificationId)` para marcar la notificación como leída en el backend.
 * 2. Actualiza el contador de notificaciones no leídas llamando a `updateNotificationBadge()`.
 * 3. Redirige al usuario a la vista de detalle de la tarea, usando el `groupId` y `taskId` proporcionados.
 *    La ruta de destino depende del rol del usuario almacenado en `localStorage` como `selectedGroupRole`.
 *
 * @function goToTaskFromNotification
 * @param {number|string} groupId - ID del grupo al que pertenece la tarea.
 * @param {number|string} taskId - ID de la tarea a visualizar.
 * @param {number|string} notificationId - ID de la notificación a marcar como leída.
 *
 * @example
 * // Desde una tarjeta de notificación en el frontend
 * goToTaskFromNotification(3, 17, 42);
 */
function goToTaskFromNotification(groupId, taskId, notificationId, role) {
  // 1. Marca como leída en backend
  markNotificationAsRead(notificationId)
    .then(() => {
      // 2. Actualiza el badge
      updateNotificationBadge();

      // 3. Setea en localStorage para que la página de destino tenga los datos
      localStorage.setItem('selectedGroupId', groupId);
      localStorage.setItem('selectedGroupRole', role);

      // 4. Redirige a la tarea
      if (role === 'admin') {
        window.location.href = `/views/admin/group-admin.html?groupId=${groupId}&taskId=${taskId}`;
      } else {
        window.location.href = `/views/user/group-member.html?groupId=${groupId}&taskId=${taskId}`;
      }
    });
}

/**
 * Marca una notificación como leída en el servidor.
 *
 * Esta función realiza una petición HTTP `PUT` al backend para actualizar el estado de lectura (`isRead`)
 * de una notificación específica, identificada por su `notificationId`.
 * Requiere que el token JWT esté almacenado en `localStorage` bajo la clave `'token'`.
 *
 * @async
 * @function markNotificationAsRead
 * @param {number|string} notificationId - ID de la notificación que se desea marcar como leída.
 *
 * @example
 * // Marcar notificación con ID 42 como leída
 * await markNotificationAsRead(42);
 */
async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem('token');
  
  await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}