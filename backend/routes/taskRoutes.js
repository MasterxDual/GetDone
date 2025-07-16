// Ruta de Tareas

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

// Importa los controladores de tareas que controlan la logica de los Endpoints
const taskController = require("../controllers/taskController");

// Middleware para proteger todas las rutas de tareas
router.use(authenticateToken);

/**
 * Ruta para crear una nueva tarea
 * @api {POST} /api/tasks
 * @apiName NewTask
 * @apiGroup Tasks
 */
router.post("/", taskController.newTask);

/**
 * Ruta para obtener todas las tareas
 * @api {GET} /api/tasks
 * @apiName GetTasks
 * @apiGroup Tasks
 */
router.get("/", taskController.getTasks);

/**
 * Buscar tareas por nombre o descripción
 * @api {GET} /api/tasks/search || /api/tasks/search?query=texto
 * @apiName SearchTasks
 * @apiGroup Tasks
 */
router.get("/search", authenticateToken, taskController.searchTasks);

/**
 * Ruta para obtener una tarea por su ID
 * @api {GET} /api/tasks/:id
 * @apiName GetTaskById
 * @apiGroup Tasks
 */
router.get("/:id", taskController.getTaskById);

/**
 * Ruta para agregar comentario a una tarea
 * @api {POST} /api/tasks/:taskId/comments
 * @apiName AddComment
 * @apiGroup Tasks
 */
router.post("/:taskId/comments", taskController.addComment);

/**
 * Ruta para obtener comentarios de una tarea
 * @api {GET} /api/tasks/:taskId/comments
 * @apiName GetComments
 * @apiGroup Tasks
 */
router.get("/:taskId/comments", taskController.getComments);

/**
 * Ruta para marcar tarea como completada
 * @api {PATCH} /api/tasks/:taskId/complete
 * @apiName MarkComplete
 * @apiGroup Tasks
 */
router.patch("/:taskId/complete", taskController.markComplete);

/**
 * Ruta para actualizar una tarea por su ID
 * @api {PUT} /api/tasks/:id
 * @apiName UpdateTask
 * @apiGroup Tasks
 */
router.put("/:id", authenticateToken, taskController.updateTask);

/**
 * Ruta para eliminar una tarea por su ID
 * @api {DELETE} /api/tasks/:id
 * @apiName DeleteTask
 * @apiGroup Tasks
 */
router.delete("/:id", authenticateToken, taskController.deleteTask);


/* Futuras implementaciones: */
// router.put("/:id", taskController.updateTask);
// router.delete("/:id", taskController.deleteTask);

// Exporta el enrutador para ser utilizado en la aplicación
module.exports = router; // Exporta el enrutador para ser utilizado en la aplicación
