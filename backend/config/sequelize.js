/* Conexion a Base de Datos */

// Importa la clase Sequelize de la librería sequelize
// Sequelize es un ORM (Object-Relational Mapping) para Node.js que permite interactuar con bases
// de datos SQL de una manera más sencilla y orientada a objetos usando JavaScript en lugar de
// querys manuales (SQL).
const { Sequelize } = require('sequelize');

// Cargar las variables de entorno desde el archivo .env usando dotenv
// Esto permite acceder a configuraciones sensibles (usuarion, contraseña, etc.) de manera segura
require('dotenv').config(); 

// Crear una nueva instancia de Sequelize para conectarse a la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME,            // Nombre de la base de datos a la que se desea conectar
    process.env.DB_USER,            // Nombre de usario para la autenticación en PostgreSQL
    process.env.DB_PASS,            // Contraseña del usuario para la autenticación en PostgreSQL
    {
        host: process.env.DB_HOST,  // Dirección IP o nombre del host donde se encuentra la base de datos
        dialect: 'postgres',        // Tipo de base de datos (en este caso PostgreSQL)

        logging: false, // Desactiva los logs de Sequelize en consola (útil en producción para evitar ruido)
        // Opcional: Configuraciones adicionales (ej: pool de conexiones, logging)
        // pool: { max: 5, min: 0, idle: 10000 }, // Configuración del pool de conexiones
    }
);

// Probar la conexión a la base de datos
// Usa 'authenticate' para verificar si la conexión es exitosa
sequelize
    .authenticate()
    .then(() => {
        console.log('Conectado a la base de datos con Sequelize');
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos con Sequelize:', err);
    });

// Exportar la instancia de Sequelize para que pueda ser utilizada en otros módulos (archivos)
// Esto permite reutilizar la misma conexión a la base de datos en diferentes partes de la aplicación (como en los modelos)
module.exports = sequelize;



/*¿Dónde se usa luego?

--> En los modelos (task.js, user.js, etc.) que se definen con sequelize.define(...)
--> En el archivo app.js para ejecutar sequelize.sync() o verificar conexión
--> En migraciones si usás Sequelize CLI

*/