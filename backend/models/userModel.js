// Modulo de Usuario

// Importa DataTypes desde Sequelize para definir tipos de datos de las columnas del modelo.
// DetaTypes es un objeto que permite especificar el tipo de dato de cada columna/campo en el modelo.
const { DataTypes } = require('sequelize');

// Importa la instancia de Sequelize que se conecta a la base de datos (conexion ya establecida)
const sequelize = require('../config/sequelize');

// Importa byscript para el hasheo seguro de contraseñas
const bcrypt = require('bcryptjs');

// Define el modelo de Usuario usando Sequelize
// El primer argumento ('User') es el nombre del modelo, y el segundo es un objeto que define las columnas de la tabla.
const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
    lastName: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
    email: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
        unique: true,                   // Debe ser único (no se permiten duplicados)
    },
    password: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL) para almacerenar la contraseña hasheada
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
}, {
    tableName: 'users',                 // Nombre de la tabla en la base de datos (en plural por convención)
    freezeTableName: true,              // Evita que Sequelize pluralice el nombre de la tabla (usará 'users' tal cual)
    underscored: true,                  // Convierte camelCase a snake_case automáticamente (Nomenclatura de la base de datos)
    
    /* Posble eliminacion (A revisar) */
    timestamps: true,                   // Asegúrate que coincida con tu tabla (si tienes created_at/updated_at)
    createdAt: 'created_at',            // Mapea createdAt a created_at
    updatedAt: false,                   // No mapea updatedAt (no tenemos este campo en la tabla)
});

// Funcion para buscar un usuario por su email
// Utiliza el metodo findOne de Sequelize para buscar un registro en la tabla 'users'.
// Retorna una promesa con el usuario encontrado o null si no existe.
async function findUserByEmail(email) {
    return await User.findOne({ where: { email: email } }); // Busca un usuario por su email
}

// Funcion para crear un nuevo usuario
// Utiliza el metodo create de Sequelize para crear un nuevo registro en la tabla 'users'.
// Retorna una promesa con el usuario creado, incluyendo su ID generado automaticamente (sin la contraseña por seguridad).
async function createUser(firstName, lastName, email, password) {
    return await User.create({ firstName, lastName, email, password }); // Crea un nuevo usuario
}


// Exporta:
// - El modelo User (para usarlo en relaciones o consultas personalizadas).
// - Las funciones findUserByEmail y createUser (para reutilizar la lógica en controladores o servicios).
module.exports = {
    User,
    findUserByEmail,
    createUser,
};









/* Implementacion Conexion con Pool - Deprecada para este proyecto */

// // Importa el Pool de conexiones a la base de datos definido en db.js
// const pool = require('../config/db');

// /**
//  * Busca un usuario por su direccion de email en la base de datos
//  * @param {string} emial - Email del usuario a buscar
//  * @returns {Promise<Object|null>} - Objeto del usuario encontrado o null si no se encuentra
//  */
// async function findUserByEmail(email) {
//     // Ejecuta una consulta SQL parametrizada para buscar por email
//     // $1 es un marcador de posición para el primer parámetro (evita inyecciones SQL)
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

//     // Retorno el primer registro encontrado (rows[0]) o undefined si no hay resultados
//     return result.rows[0];
// }


// /**
//  * Crea un nuevo usuario en la base de datos
//  * @param {string} firstName - Nombre del nuevo usuario
//  * @param {string} lastName - Apellido del nuevo usuario
//  * @param {string} email - Email del nuevo usuario
//  * @param {string} hashedPassword - Contraseña ya hasheada (no almacenar contraseñas de texto plano) del nuevo usuario
//  * @returns {Promise<Object>} - Objeto con los datos basicos de usarios creado (sin la contraseña)
//  */
// async function createUser(firstName, lastName, email, password) {
//     // Ejecuta una inserción SQL parametrizada para crear un nuevo usuario
//     // La clausula RETURNING especifica que datos queremos recibir tras la inserción
//     const result = await pool.query(
//         'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
//         [firstName, lastName, email, password]
//     );

//     // Retorna el registro creado (sin incluir el campo passwoerd por seguridad)
//     return result.rows[0];
// }

// // Exporta las funciones para que puedan ser utilizadas en otros módulos
// module.exports = {
//     findUserByEmail,
//     createUser,
// };