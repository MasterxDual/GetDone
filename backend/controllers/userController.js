// Controlador de Usuarios

// Importa byscript para el hasheo seguro de contraseñas
const bcrypt = require('bcryptjs');
// Importa el modelo de Usuario para interactuar con la base de datos
const userModel = require('../models/userModel');

// Importamos Sequelize para poder manejar sus errores específicos
const { UniqueConstraintError } = require('sequelize');

// Importamos jsonwebtoken para manejar la autenticación basada en tokens
const jwt = require('jsonwebtoken');

// Importar dotenv para manejar variables de entorno
require('dotenv').config();


/**
 * Controlador para registrar un nuevo usuario
 * @param {Object} req - Objeto de solicitud HTTP (contiene email y password en el body)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con el resultado de la operación
 */
async function register(req, res) {
    // Extrae el email y la contraseña del cuerpo de la solicitud
    const { firstName, lastName,  email, password } = req.body;

    
    // Validacion basica de campos requeridos
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    email.trim().toLowerCase(); // Elimina espacios en blanco y convierte a minúsculas
    
    try {
        // Busca si ya existe un usuario con el mismo email
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Hashea la contraseña usando bcrypt con un salt de 10 rondas (balance entre seguridad y rendimiento)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea un nuevo usuario en la base de datos
        const newUser = await userModel.createUser(
            firstName,
            lastName,
            email,
            hashedPassword
        );

        // Respuesta exitosa (201 Created)
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            } // Retorna el nuevo usuario sin la contraseña
        });
    } catch (error) {
        // Manejo específico para error de violación de restricción única
        if (error instanceof UniqueConstraintError ||
            (error.name && error.name === 'SequelizeUniqueConstraintError')) {
            return res.status(409).json({
                message: 'Email already in use',
                detail: 'This email address is already registered in our system.'
            });
        }


        // Maneja cualquier error que pueda ocurrir durante la operación
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Controlador para iniciar sesión de un usuario
 * @param {Object} req - Objeto de solicitud HTTP (contiene email y password en el body)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con el resultado de la operación
 */
async function login(req, res) {

    // Extrae el email y la contraseña de la solucitud
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    email.trim().toLowerCase(); // Normaliza el email a minúsculas

    try {
        // Buscar el usuario en la base de datos
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenciales invalidas" });
        }

        // Comparar contraseñas
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        // Si todo es correcto, generar token de sesión JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '10m' } // Expira en 10 minutos
        );

        res.json({
            success: true,
            token, // Retorna el token generado
            user: {
                id: user.id,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

/**
 * Controlador para restablecer la contraseña de un usuario.
 *
 * Este endpoint permite que un usuario cambie su contraseña actual 
 * proporcionando su email y una nueva contraseña. 
 * Si el email existe en la base de datos, se actualiza la contraseña
 * con una versión hasheada utilizando bcrypt.
 *
 * @async
 * @function
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Contiene el email del usuario y la nueva contraseña.
 * @param {string} req.body.email - Email del usuario que solicita el cambio de contraseña.
 * @param {string} req.body.password - Nueva contraseña en texto plano.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} - Respuesta JSON con mensaje de éxito o error.
 *
 * @example
 * // Petición POST al endpoint correspondiente
 * POST /api/users/reset-password
 * Body:
 * {
 *   "email": "usuario@example.com",
 *   "password": "nuevaContraseña123"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "message": "Contraseña actualizada correctamente."
 * }
 */
async function resetPassword(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y nueva contraseña son requeridos.' });
    }

    try {
        // Busca el usuario por email
        const user = await userModel.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            return res.status(404).json({ message: 'No existe un usuario registrado con ese email.' });
        }

        // Hashea la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualiza la contraseña en la base de datos
        await userModel.updateUserPassword(email, hashedPassword);

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}


/**
 * Controlador para validar los datos del usuario antes de restablecer la contraseña.
 * 
 * Este endpoint recibe el nombre, apellido y email desde el cuerpo de la solicitud,
 * y verifica si el usuario existe en la base de datos y si los datos coinciden.
 * 
 * @async
 * @function validateUserData
 * @param {Object} req - Objeto de solicitud HTTP (Express). Espera un `body` con `firstName`, `lastName` y `email`.
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 * 
 * @returns {Object} JSON con la propiedad `valid`:
 * - `{ valid: true }` si los datos coinciden con los de un usuario existente.
 * - `{ valid: false, message: string }` si hay error de validación o campos faltantes.
 * 
 * @example
 * // Petición HTTP POST
 * {
 *   "firstName": "Agus",
 *   "lastName": "Pérez",
 *   "email": "agus@example.com"
 * }
 * 
 * // Posible respuesta
 * {
 *   "valid": true
 * }
 */
async function validateUserData(req, res) {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ valid: false, message: 'Faltan campos.' });
    }
    try {
        const user = await userModel.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            return res.status(404).json({ valid: false, message: 'Email no registrado.' });
        }
        if (user.firstName !== firstName || user.lastName !== lastName) {
            return res.status(400).json({ valid: false, message: 'Nombre y/o apellido incorrecto.' });
        }
        return res.json({ valid: true });
    } catch (error) {
        return res.status(500).json({ valid: false, message: 'Error en validación.' });
    }
}


/**
 * @function getProfile
 * @description Controlador para obtener el perfil del usuario autenticado.
 * Extrae el ID del usuario desde el objeto `req.user` (usualmente proporcionado por middleware de autenticación)
 * y retorna los datos básicos del perfil (nombre, apellido, email).
 *
 * @async
 * @param {Object} req - Objeto de solicitud HTTP (Express).
 * @param {Object} req.user - Objeto de usuario inyectado por middleware de autenticación.
 * @param {number} req.user.id - ID del usuario autenticado.
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 *
 * @returns {Promise<void>} Retorna una respuesta JSON con los datos del perfil o un error correspondiente.
 *
 * @throws {404} Si el usuario no existe en la base de datos.
 * @throws {500} Si ocurre un error inesperado en el servidor (no capturado explícitamente en este fragmento).
 */
async function getProfile(req, res) {
    // Asume que tienes el usuario en la sesión/token autenticado
    const userId = req.user.id;

    // Buscar usuario en la base de datos
    const user = await userModel.getUserById(userId);

    // Si no se encuentra el usuario, devolver error 404
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Responder con los datos del perfil
    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    });
}

/**
 * @function updateProfile
 * @description Controlador para actualizar el perfil del usuario autenticado. 
 * Permite modificar el nombre, apellido y, opcionalmente, la contraseña (si se proporciona la actual y la nueva).
 *
 * @async
 * @param {Object} req - Objeto de solicitud HTTP (Express).
 * @param {Object} req.user - Objeto del usuario autenticado, proporcionado por middleware.
 * @param {number} req.user.id - ID del usuario autenticado.
 * @param {Object} req.body - Cuerpo de la solicitud con los datos a actualizar.
 * @param {string} req.body.firstName - Nuevo nombre del usuario.
 * @param {string} req.body.lastName - Nuevo apellido del usuario.
 * @param {string} [req.body.currentPassword] - Contraseña actual (requerida si se quiere cambiar la contraseña).
 * @param {string} [req.body.newPassword] - Nueva contraseña (requerida si se quiere cambiar la contraseña).
 *
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 * 
 * @returns {Promise<void>} Retorna una respuesta JSON con un mensaje de éxito o error.
 *
 * @throws {400} Si faltan nombre o apellido, o si la contraseña actual es incorrecta.
 * @throws {404} Si el usuario no se encuentra en la base de datos (implícito si `getUserById` falla silenciosamente).
 * @throws {500} Si ocurre un error inesperado en el servidor (no manejado explícitamente).
 */
/* async function updateProfile(req, res) {
    const userId = req.user.id;
    const { firstName, lastName, currentPassword, newPassword } = req.body;

    // Validación básica
    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'Nombre y apellido son obligatorios.' });
    }

    // Actualizar nombre y apellido
    await userModel.updateNames(userId, firstName, lastName);

    // Cambiar contraseña si corresponde
    if (currentPassword && newPassword) {
        const user = await userModel.getUserById(userId);

        //Compara si la clave actual de la sesión es igual a la que tiene en la base de datos
        const valid = await bcrypt.compare(currentPassword, user.password);

        // Si la contraseña actual no es válida, devolver error 400
        if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta.' });

        // Hashear la nueva contraseña y actualizarla en la base de datos
        const hash = await bcrypt.hash(newPassword, 10);
        await userModel.updatePassword(userId, hash);
    }

    res.json({ message: 'Perfil actualizado correctamente.' });
}
 */


/**
 * Actualiza un campo específico del perfil del usuario autenticado.
 *
 * @async
 * @function updateProfileField
 * @param {Object} req - Objeto de solicitud HTTP Express.
 * @param {Object} req.user - Objeto de usuario autenticado, inyectado por middleware.
 * @param {string} req.user.id - ID del usuario autenticado.
 * @param {Object} req.body - Cuerpo de la solicitud HTTP.
 * @param {string} req.body.field - Campo del perfil a actualizar (solo 'firstName' o 'lastName' permitidos).
 * @param {string} req.body.value - Nuevo valor para el campo especificado.
 * @param {Object} res - Objeto de respuesta HTTP Express.
 *
 * @returns {Promise<void>} Retorna una respuesta JSON indicando el éxito o el error de la operación.
 *
 * @description
 * Esta función valida que el campo solicitado para actualizar sea permitido ('firstName' o 'lastName').
 * Si la validación es exitosa, actualiza dicho campo en la base de datos y responde con un mensaje de éxito.
 * En caso de error, responde con un mensaje y el código de estado correspondiente.
 */
async function updateProfileField(req, res) {
  const userId = req.user.id;
  const { field, value } = req.body;

  const allowedFields = ['firstName', 'lastName'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: 'Campo no válido' });
  }

  try {
    await userModel.updateField(userId, field, value);
    res.json({ message: `${field} actualizado correctamente.` });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el campo' });
  }
}


// Exportar el controlador para su uso en las rutas
module.exports = {
    register,
    login,
    resetPassword,
    validateUserData,
    getProfile,
    updateProfileField
};