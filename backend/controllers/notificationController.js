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
    const userId = req.user.id;
    const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
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
async function markNotificationAsRead(req, res) {
    try {
        const userId = req.user.id;
    
        await Notification.update({ isRead: true }, { where: { userId } });
    
        res.json({ ok: true });
    } catch(error) {
        console.error('Error en markNotificationAsRead:', error);
        return res.status(500).json({ error: 'Error interno al marcar notificaciones como leídas' });
    }
}

module.exports = {
    getNotifications,
    markNotificationAsRead
};