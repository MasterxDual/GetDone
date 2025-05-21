// /* Conexion a BD Postgresl Deprecada by Agus */
// //Añadimos sequelize al archivo
// const { Sequelize } = require('sequelize');


// //Creamos una instancia de Sequelize y la configuramos con los valores del archivo .env
// //Esto permite que las credenciales estén protegidas y no se codifiquen directamente en el código
// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST, // Dirección del servidor de la base de datos (usualmente 'localhost')
//     dialect: 'postgres', // Tipo de base de datos (PostgreSQL en este caso)
//     logging: false // Desactiva los logs SQL por consola (útil para evitar ruido)
//   }
// );

// // Exportamos la instancia de Sequelize para que pueda ser utilizada en otros archivos del proyecto
// module.exports = sequelize;

// /*¿Dónde se usa luego?

// --> En los modelos (task.js, user.js, etc.) que se definen con sequelize.define(...)
// --> En el archivo app.js para ejecutar sequelize.sync() o verificar conexión
// --> En migraciones si usás Sequelize CLI */



/* <-----------------------------------------------------------> */



// /* Conexion a base de datos Deprecada by Tobias*/


// // Conexion a la base de datos

// // Importa la clase Pool de la librería pg (node-postgres)
// // Esta librería permite interactuar con bases de datos PostgreSQL desde Node.js
// // La clase Pool permite crear y manejar un grupo de conexiones a la base de datos
// const { Pool } = require('pg');

// require('dotenv').config(); // Carga las variables de entorno desde un archivo .env
// // La librería dotenv permite gestionar variables de entorno en Node.js

// // Crea una nueva instancia de Pool con la configuración de conexión a la base de datos
// const pool = new Pool({
//     database: process.env.DB_NAME,     // Nombre de la base de datos a la que se desea conectar
//     user: process.env.DB_USER,         // Nombre de usario para la autenticación en PostgreSQL
//     password: process.env.DB_PASS,     // Contraseña del usuario para la autenticación en PostgreSQL
//     host: process.env.DB_HOST,         // Dirección IP o nombre del host donde se encuentra la base de datos
//     port: 5432                         // Puerto en el que PostgreSQL está escuchando (por defecto es 5432)
// });

// // Prueba la conexión a la base de datos
// pool.query('SELECT NOW()')
//     .then(res => console.log('Conectado a la base de datos:', res.rows[0]))
//     .catch(err => console.error('Error al conectar a la base de datos:', err));


// // Exporta la instancia de Pool para que pueda ser utilizada en otros módulos
// // Esto permite reutilizar la misma conexión a la base de datos en diferentes partes de la aplicación
// module.exports = pool;
