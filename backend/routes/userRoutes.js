// Ruta de Usuarios

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

// Importa los controladores de usuario que controlan la logica de los Endpoints
const userController = require("../controllers/userController");

// Importa el controlador de correo electrónico para enviar códigos de verificación
const emailController = require("../controllers/emailController");

/**
 * Ruta para enviar el código de verificación por correo electrónico
 * @api {POST} /api/users/sendVerificationCode
 * @apiName SendVerificationCode
 * @apiGroup Users
 */
router.post('/sendVerificationCode', emailController.sendVerificationCode);

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