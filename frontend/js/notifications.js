/* Usamos polling para actualizar el contador de notificaciones
Polling:
--> Consiste en hacer una petición al backend cada cierto intervalo (por ejemplo, cada 30 segundos) para traer las notificaciones.
--> Es más simple de implementar y funciona en cualquier entorno.
#Ventaja: Fácil de implementar
#Desventaja: Puede haber un pequeño retraso y un consumo innecesario de recursos si hay muchos usuarios y peticiones. */

window.addEventListener('DOMContentLoaded', function() {
  updateNotificationBadge();
  setInterval(updateNotificationBadge, 30000); // cada 30 segundos se actualiza el contador
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
  
  // let html = '<div class="dropdown-menu show" id="notificationsDropdown" style="width:350px; max-height:400px; overflow:auto;">';
  // let html = '<div class="dropdown-menu" id="notificationsDropdown">';
  let html = '<div class="dropdown-menu show" id="notificationsDropdown" style="width:350px; max-height:400px; overflow:auto; right:0; top:100%; position:absolute; z-index:999;">';
  
  if (notifications.length === 0) {
    html += '<span class="dropdown-item-text">Sin notificaciones</span>';
  } else {
    notifications.forEach(n => {
      html += `<div class="dropdown-item${n.isRead ? '' : ' fw-bold'}">
        <i class="bi bi-info-circle me-2"></i> ${n.message}
        <div class="text-muted small">${new Date(n.created_at).toLocaleString()}</div>
      </div>`;
    });
    html += '<div class="dropdown-divider"></div><button class="dropdown-item text-center text-primary" onclick="markAllNotificationsRead()">Marcar todas como leídas</button>';
  }
  html += '</div>';

  // Borra otros dropdowns y muestra este
  const iconContainer = document.querySelector('.notification-icon-container');
  iconContainer.insertAdjacentHTML('beforeend', html);

  // Opcional: cierra al hacer click fuera
  document.addEventListener('click', function closeDropdown(e) {
    if (!e.target.closest('#notificationsDropdown') && !e.target.closest('.notification-icon-container')) {
      document.getElementById('notificationsDropdown')?.remove();
      document.removeEventListener('click', closeDropdown);
    }
  });
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
