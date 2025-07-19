// Ruta de Usuarios

// Importa el framework Express y crea un enrutador
const express = require("express");
const router = express.Router();

// Importa los controladores de usuario que controlan la logica de los Endpoints
const userController = require("../controllers/userController");

// Importa el controlador de correo electrónico para enviar códigos de verificación
const emailController = require("../controllers/emailController");

// Importa el middleware de autenticación para proteger rutas que requieren autenticación
const authenticateToken = require("../middleware/authMiddleware");

/**
 * Ruta para enviar el código de verificación por correo electrónico
 * @api {POST} /api/users/sendVerificationCode
 * @apiName SendVerificationCode
 * @apiGroup Users
 */
router.post('/sendVerificationCode', emailController.sendVerificationCode);


/**
 * Ruta para enviar el código para restablecer la contraseña
 * @api {POST} /api/users/sendResetPasswordCode
 * @apiName SendResetPasswordCode
 * @apiGroup Users
 */
router.post('/sendResetPasswordCode', emailController.sendResetPasswordCode);


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

/**
 * Ruta para restablecer la contraseña en la base de datos
 * @api {POST} /api/users/resetPassword
 * @apiName ResetPassword
 * @apiGroup Users
 */
router.post('/resetPassword', userController.resetPassword);

/**
 * Ruta para validar los datos del usuario antes de restablecer la contraseña. Aquí es necesario el email del usuario. Esto se hace en el restablecimiento de contraseña.
 * @api {POST} /api/users/validateUserData
 * @apiName ValidateUserData
 * @apiGroup Users
 */
router.post('/validateUserData', userController.validateUserData);

/**
 * Ruta para actualizar el nombre del usuario autenticado
 * @api {GET} /api/users/updateFirstName
 * @apiName UpdateFirstName
 * @apiGroup Users
 */
router.patch('/firstName', authenticateToken, userController.updateFirstName);

/**
 * Ruta para actualizar el apellido del usuario autenticado
 * @api {GET} /api/users/updateLastName
 * @apiName UpdateLastName
 * @apiGroup Users
 */
router.patch('/lastName', authenticateToken, userController.updateLastName);


/**
 * Ruta para actualizar la contraseña del usuario autenticado. Aquí no es necesario el email del usuario. Esto se hace en la pantalla de configuración.
 * @api {PATCH} /api/users/password
 * @apiName UpdatePassword
 * @apiGroup Users
 */
router.patch('/password', authenticateToken, userController.updatePassword);


/**
 *
 * Ruta para obtener los datos de usuario iniciado en la sesión actual
 * @api {GET} /api/users/getProfile
 * @apiName GetProfile
 * @apiGroup Users
 * */  
router.get('/profile', authenticateToken, userController.getProfile)

// Exporta el router para ser usado en la aplicación principal
module.exports = router;