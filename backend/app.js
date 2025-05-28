// Servidor Principal

// Importar dependencias: Framework Express y el Middleware CORS
// Cors permite que el servidor acepte solicitudes de diferentes dominios (Cross-Origin Resource Sharing)
// Esto es útil para aplicaciones frontend que se ejecutan en un dominio diferente al del backend
// de la API (por ejemplo, si el frontend está en localhost:3000 y el backend en localhost:5000)
const express = require('express');
const cors = require('cors');

const path = require('path'); // Para trabajar con rutas de archivos

// Importar dotenv para manejar variables de entorno
require('dotenv').config();

// Importa las rutas de usuarios, tareas y grupos
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authenticateToken = require('./middleware/authMiddleware');

// Importa la configuración de Sequelize para establecer la conexión a la base de datos
const sequelize = require('./config/sequelize');

// IMPORTANTE: Importar las asociaciones de los modelos ANTES de sincronizar
// Esto debe hacerse después de importar sequelize pero antes de sync()
require('./models/associationsModel');

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el middleware CORS para permitir solicitudes de diferentes orígenes
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite el parseo de JSON en las solicitudes

// Middleware que permite leer datos enviados desde formularios HTML (form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// // Middleware para servir archivos estáticos desde la carpeta 'public'
// // Esto permite acceder al HTML, CSS y JS del frontend sin rutas adicionales
// app.use(express.static('frontend'));

// Servir toda la carpeta frontend como estática
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuracion de rutas
app.use('/api/users', userRoutes); // Monta la rutas de usuarios bajo /api/users
app.use('/api/tasks', authenticateToken, taskRoutes); // Protege rutas de tareas con JWT
app.use('/api/groups', authenticateToken, groupRoutes); // Protege rutas de grupos con JWT

// Puerto del servidor
const PORT = 3000;

// Ruta raiz/de inicio
// Esta ruta responde a las solicitudes GET en la raíz del servidor (http://localhost:3000/)
app.get('/', (req, res) => {
    res.send('Welcome to the API of GetDone');
});

// Sincronización de la base de datos e inicio del servidor
// -------------------------------------------------------
// sequelize.sync() sincroniza los modelos de Sequelize con las tablas de la base de datos:
// - Si las tablas no existen, las crea (en desarrollo).
// - Si existen, verifica que coincidan con los modelos (opcionalmente con alter: true).

// NOTA: En desarrollo puedes usar { force: true } para recrear las tablas
// En producción usa { alter: true } para actualizar sin perder datos
sequelize.sync({ alter: true }) // Cambiado de sync() a sync({ alter: true })
    .then(() => {
        console.log('✅ Base de datos sincronizada correctamente');
        console.log('📊 Tablas creadas/actualizadas: users, groups, group_members, tasks, task_comments, invitations');
        
        // Una vez sincronizada la BD, inicia el servidor en el puerto especificado.
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log('📝 API endpoints disponibles:');
            console.log('   - GET  / (página de bienvenida)');
            console.log('   - API  /api/users (gestión de usuarios)');
            console.log('   - API  /api/tasks (gestión de tareas)');
        });
    })
    .catch(err => {
        // Si hay un error en la conexión o sincronización, lo muestra en consola.
        console.error('❌ Error al conectar con la base de datos:', err);
        console.error('💡 Verifica que PostgreSQL esté corriendo y la configuración sea correcta');
    });



/* Funcionalidad Deprecada: */

// // Iniciar el servidor y escuchar en el puerto definido
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });