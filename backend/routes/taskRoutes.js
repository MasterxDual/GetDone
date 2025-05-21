// Ruta de Tareas

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

// Importa los controladores de tareas que controlan la logica de los Endpoints
const taskController = require("../controllers/taskController");

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
 * Ruta para obtener una tarea por su ID
 * @api {GET} /api/tasks/:id
 * @apiName GetTaskById
 * @apiGroup Tasks
 */
router.get("/:id", taskController.getTaskById);


/* Futuras implementaciones: */
// router.put("/:id", taskController.updateTask);
// router.delete("/:id", taskController.deleteTask);

// Exporta el enrutador para ser utilizado en la aplicación
module.exports = router; // Exporta el enrutador para ser utilizado en la aplicación