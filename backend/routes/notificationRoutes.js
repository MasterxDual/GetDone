// Ruta de Notificaciones

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

// Importa los controladores de tareas que controlan la logica de los Endpoints
const notificationController = require("../controllers/notificationController");

// Middleware para proteger todas las rutas de tareas
router.use(authenticateToken);


/**
 * Ruta para crear obtener las notificaciones
 * @api {GET} /api/notifications
 * @apiName GetNotifications
 * @apiGroup Notifications
 * @apiSuccess {Array} notifications Lista de notificaciones del usuario autenticado
 * */  
router.get("/", authenticateToken, notificationController.getNotifications);

/** * Ruta para marcar una notificación como leída
 * @api {POST} /api/notifications/markasread
 * @apiName MarkNotificationAsRead
 * @apiGroup Notifications
 * @apiSuccess {String} respuesta JSON que indica que la operación fue exitosa
 * */
router.post("/markasread", authenticateToken, notificationController.markNotificationAsRead);

// Exporta el enrutador para que pueda ser utilizado en la aplicación principal
// Esto permite que las rutas de notificaciones sean accesibles desde la aplicación principal
// y se integren con el middleware de autenticación
// y otros middlewares que hayas definido.
// Esto es importante para que las rutas de notificaciones funcionen correctamente
// y se apliquen las reglas de seguridad y autenticación definidas en el middleware.
// Además, al exportar el enrutador, puedes importarlo en tu archivo principal (app.js o index.js)
// y usarlo para definir las rutas de tu API de notificaciones.
// Esto es útil para mantener el código modular y organizado, separando las rutas de notificaciones
// de otras rutas de la aplicación, como las de usuarios o tareas.      
module.exports = router;