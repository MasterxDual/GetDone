// Ruta de Usuarios

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

// Importa los controladores de usuario que controlan la logica de los Endpoints
const userController = require("../controllers/userController");

/**
 * Ruta para registrar un nuevo usuario
 * @api {POST} /api/users/register
 * @apiName RegisterUser
 * @apiGroup Users
 */
router.post("/register", userController.register);

/**
 * Ruta para iniciar sesión de un usuario
 * @api {POST} /api/users/login
 * @apiName LoginUser
 * @apiGroup Users
 */
router.post("/login", userController.login);

// Exporta el router para ser usado en la aplicación principal
module.exports = router;