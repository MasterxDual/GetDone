/* Controlador para notificar a los usuarios por diversos motivos:
--> La tarea está por vencer en 1 día o menos
--> La fecha de vencimiento de la tarea fue modificada
--> Se asignó una nueva tarea a un usuario */


// Importar dependencias
const Notification = require('../models/notificationModel'); // Importa el modelo de notificaciones

/**
 * Obtiene todas las notificaciones del usuario autenticado, ordenadas por fecha de creación descendente.
 *
 * @async
 * @function getNotifications
 * @param {Object} req - Objeto de solicitud HTTP (Express).
 * @param {Object} req.user - Usuario autenticado (inyectado desde middleware de autenticación).
 * @param {number} req.user.id - ID del usuario autenticado.
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 * @returns {JSON} - Arreglo de objetos de notificación con estructura:
 * [
 *   {
 *     userId: number,
 *     type: string,        // 'expiring' | 'date_changed' | 'assignment'
 *     taskId: number|null,
 *     message: string,
 *     isRead: boolean,
 *     created_at: string   // Timestamp de creación (ISO 8601)
 *   },
 *   ...
 * ]
 *
 * @example
 * // Petición desde el cliente
 * fetch('/api/notifications', {
 *   headers: { 'Authorization': 'Bearer <token>' }
 * })
 * .then(res => res.json())
 * .then(notifications => {
 *   console.log(notifications);
 * });
 */
async function getNotifications(req, res) {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['created_at', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error en getNotifications:', error);
        res.status(500).json({ error: 'Error interno al obtener notificaciones' });
    }
}

/**
 * Marca todas las notificaciones de un usuario como leídas.
 *
 * @async
 * @function markNotificationAsRead
 * @param {Object} req - Objeto de solicitud HTTP (Express).
 * @param {Object} req.user - Usuario autenticado extraído del token JWT.
 * @param {number} req.user.id - ID del usuario autenticado.
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 * @returns {JSON} JSON con `{ ok: true }` indicando éxito en la operación.
 *
 * @example
 * // Petición desde el frontend con token válido
 * fetch('/api/notifications/read', {
 *   method: 'PUT',
 *   headers: { 'Authorization': 'Bearer <token>' }
 * })
 * .then(res => res.json())
 * .then(data => {
 *   if (data.ok) {
 *     console.log('Notificaciones marcadas como leídas');
 *   }
 * });
 */
async function markAllNotificationsAsRead(req, res) {
    try {
        const userId = req.user.id;
    
        await Notification.update({ isRead: true }, { where: { userId } });
    
        res.json({ ok: true });
    } catch(error) {
        console.error('Error en markNotificationAsRead:', error);
        return res.status(500).json({ error: 'Error interno al marcar notificaciones como leídas' });
    }
}

/**
 * Elimina todas las notificaciones asociadas al usuario autenticado.
 *
 * @async
 * @function deleteAllNotifications
 * @param {Object} req - Objeto de solicitud de Express. Debe contener el usuario autenticado en `req.user`.
 * @param {Object} res - Objeto de respuesta de Express, utilizado para devolver el resultado al cliente.
 * @returns {Promise<void>} Devuelve una respuesta JSON indicando éxito o error.
 *
 * @throws {500} En caso de error durante la eliminación en la base de datos, responde con estado HTTP 500.
 */
async function deleteAllNotifications(req, res) {
  try {
    const userId = req.user.id;
    await Notification.destroy({
      where: { userId }
    });
    res.json({ message: 'Todas las notificaciones borradas' });
  } catch (error) {
    console.error('Error al borrar notificaciones:', error);
    res.status(500).json({ error: 'Error interno al borrar notificaciones' });
  }
}

/**
 * Marca una notificación específica como leída para el usuario autenticado.
 *
 * Esta función busca una notificación por su ID (`req.params.id`) y verifica que pertenezca
 * al usuario autenticado (`req.user.id`). Si existe, actualiza el campo `isRead` a `true`.
 *
 * @async
 * @function markNotificationAsRead
 * @param {Object} req - Objeto de solicitud HTTP de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {number|string} req.params.id - ID de la notificación a marcar como leída.
 * @param {Object} req.user - Objeto del usuario autenticado (inyectado por middleware).
 * @param {number} req.user.id - ID del usuario autenticado.
 * @param {Object} res - Objeto de respuesta HTTP de Express.
 * @returns {JSON} - Respuesta en formato JSON indicando éxito (`{ ok: true }`) o error.
 *
 * @example
 * // Petición desde el frontend:
 * fetch('/api/notifications/5/markasread', {
 *   method: 'PUT',
 *   headers: { 'Authorization': `Bearer <token>` }
 * });
 */
async function markNotificationAsRead(req, res) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id; // del middleware de autenticación
    const notification = await Notification.findOne({ where: { id: notificationId, userId } });

    if (!notification) return res.status(404).json({ error: 'No encontrada' });

    notification.isRead = true;

    await notification.save();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al marcar como leída' });
  }
}

module.exports = {
    getNotifications,
    markAllNotificationsAsRead,
    deleteAllNotifications,
    markNotificationAsRead
};