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
 * Actualiza el primer nombre (`firstName`) del usuario autenticado.
 *
 * @async
 * @function updateFirstName
 * @param {Object} req - Objeto de solicitud (request) de Express.
 * @param {Object} req.user - Objeto que contiene los datos del usuario autenticado, inyectado por middleware.
 * @param {string} req.user.id - ID del usuario autenticado.
 * @param {Object} req.body - Cuerpo de la solicitud que contiene el nuevo `firstName`.
 * @param {Object} res - Objeto de respuesta (response) de Express.
 * 
 * @returns {Object} JSON con el resultado de la operación:
 * - 200 OK si el nombre fue actualizado correctamente.
 * - 400 Bad Request si faltan datos requeridos.
 * - 404 Not Found si el usuario no existe.
 * - 500 Internal Server Error si ocurrió un error en el servidor.
 *
 * @example
 * PATCH /api/user/firstName
 * Body: { "firstName": "Juan" }
 */
async function updateFirstName(req, res) {
    try {
        const userId = req.user?.id; // Debería estar seteado por tu middleware de autenticación
        const { firstName } = req.body;
        if (!firstName || !userId) {
            return res.status(400).json({ success: false, message: 'First name and user ID required.' });
        }

        const [updated] = await userModel.User.update(
            { firstName },
            { where: { id: userId } }
        );

        if (updated === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({ success: true, message: 'First name updated.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error updating first name.' });
    }
}

/**
 * Actualiza el apellido (`lastName`) del usuario autenticado.
 *
 * @async
 * @function updateLastName
 * @param {Object} req - Objeto de solicitud (request) de Express.
 * @param {Object} req.user - Objeto que contiene los datos del usuario autenticado, inyectado por middleware.
 * @param {string} req.user.id - ID del usuario autenticado.
 * @param {Object} req.body - Cuerpo de la solicitud que contiene el nuevo `lastName`.
 * @param {Object} res - Objeto de respuesta (response) de Express.
 * 
 * @returns {Object} JSON con el resultado de la operación:
 * - 200 OK si el apellido fue actualizado correctamente.
 * - 400 Bad Request si faltan datos requeridos.
 * - 404 Not Found si el usuario no existe.
 * - 500 Internal Server Error si ocurrió un error en el servidor.
 *
 * @example
 * PATCH /api/user/lastName
 * Body: { "lastName": "Pérez" }
 */
async function updateLastName(req, res) {
    try {
        const userId = req.user?.id;
        const { lastName } = req.body;
        if (!lastName || !userId) {
            return res.status(400).json({ success: false, message: 'Last name and user ID required.' });
        }

        const [updated] = await userModel.User.update(
            { lastName },
            { where: { id: userId } }
        );

        if (updated === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({ success: true, message: 'Last name updated.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error updating last name.' });
    }
}

/**
 * Actualiza la contraseña del usuario autenticado.
 *
 * @async
 * @function updatePassword
 * @param {Object} req - Objeto de solicitud HTTP de Express.
 * @param {Object} req.user - Información del usuario autenticado, inyectada por el middleware de autenticación.
 * @param {string} req.user.id - ID del usuario autenticado.
 * @param {Object} req.body - Cuerpo de la solicitud con las contraseñas.
 * @param {string} req.body.currentPassword - Contraseña actual del usuario.
 * @param {string} req.body.newPassword - Nueva contraseña a establecer.
 * @param {Object} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} Devuelve una respuesta JSON con el estado de la operación:
 * - `200 OK` si la contraseña se actualizó correctamente.
 * - `400 Bad Request` si faltan campos.
 * - `401 Unauthorized` si la contraseña actual no es válida.
 * - `404 Not Found` si el usuario no existe.
 * - `500 Internal Server Error` en caso de error inesperado.
 *
 * @example
 * // Solicitud PATCH desde el cliente:
 * fetch('/api/user/password', {
 *   method: 'PATCH',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     currentPassword: 'abc123',
 *     newPassword: 'nuevaClaveSegura'
 *   })
 * });
 */
async function updatePassword(req, res) {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both current and new password required.' });
        }

        // Obtener usuario de la base de datos
        const user = await userModel.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verificar contraseña actual
        const isMatch = await require('bcryptjs').compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await require('bcryptjs').hash(newPassword, 10);

        // Actualizar la contraseña
        user.password = hashedPassword;
        await user.save();

        return res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error updating password.' });
    }
}

/**
 * Obtiene el perfil del usuario autenticado.
 *
 * Esta función busca el perfil del usuario en la base de datos a partir del ID
 * extraído del token JWT previamente validado por el middleware de autenticación.
 * Retorna los datos del usuario (sin incluir la contraseña).
 *
 * @async
 * @function getProfile
 * @param {Object} req - Objeto de solicitud de Express, que contiene el `user.id` inyectado por el middleware de autenticación.
 * @param {Object} res - Objeto de respuesta de Express, usado para enviar la respuesta HTTP.
 * @returns {JSON} Devuelve un objeto JSON con los datos del usuario (`id`, `firstName`, `lastName`, `email`) o un mensaje de error.
 *
 * @throws {401} Si el usuario no está autenticado.
 * @throws {404} Si no se encuentra el usuario en la base de datos.
 * @throws {500} Si ocurre un error en la base de datos o en el servidor.
 */
async function getProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Busca el usuario
        const user = await userModel.User.findByPk(userId, {
            attributes: ['id', 'firstName', 'lastName', 'email'] // No devuelvas password
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not fetch profile' });
    }
}

// Exportar el controlador para su uso en las rutas
module.exports = {
    register,
    login,
    resetPassword,
    validateUserData,
    updateFirstName,
    updateLastName,
    updatePassword,
    getProfile
};