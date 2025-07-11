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
exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y nueva contraseña son requeridos.' });
    }

    try {
        //Se utiliza la funcion creada en userModel que busca el usuario que coincida su email en la base de datos
        const user = await userModel.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            return res.status(404).json({ message: 'No existe un usuario registrado con ese email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //Actualiza la contraseña del usuario en la base de datos
        await userModel.updateUserPassword(email, hashedPassword);

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Exportar el controlador para su uso en las rutas
module.exports = {
    register,
    login,
};