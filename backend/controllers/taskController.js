// Controlador de tareas

// Importamos el modelo 'taskModel' desde la carpeta de modelos
// Este modelo está vinculado a la tabla de PostgreSQL
const taskModel = require('../models/taskModel');

/**
 * Controlador para registrar una nueva tarea
 * @param {Object} req - Objeto de solicitud HTTP (contiene los datos de la tarea en el body)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con el resultado de la operación
 */
async function newTask(req, res) {
    try {
        // Extraemos los campos enviados en el body del formulario (HTML o JSON)
        const { title, description, delivery_date, priority } = req.body;

        // Creamos una nueva tarea en la base de datos usando Sequelize
        const tarea = await taskModel.create({
            title,
            description,
            delivery_date,
            priority: priority // Este valor debe coincidir con el ENUM definido: 'Alta', 'Media' o 'Baja'
        });

        // Respondemos con estado 201 (creado) y la tarea generada
        res.status(201).json({ mensaje: 'Tarea creada', tarea });
    } catch (err) {
        // Si ocurre un error en la base de datos o en los datos enviados, lo capturamos
        console.error(err);

        // Enviamos un error genérico
        res.status(500).json({ error: 'Error al crear tarea' });
    }
}

/**
 * Controlador para obtener todas las tareas
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con todas las tareas
 */
async function getTasks(req, res) {
    try {
        // Consultamos todas las tareas usando Sequelize
        const tareas = await taskModel.findAll();

        // Devolvemos las tareas como JSON
        res.json(tareas);
    } catch (err) {
        console.error(err);

        // Si hay un error, devolvemos 500 con mensaje de error
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
}

/**
 * Controlador para obtener una tarea por su ID
 * @param {Object} req - Objeto de solicitud HTTP (contiene el ID de la tarea en los parámetros)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con la tarea encontrada o error 404 si no existe
 */
async function getTaskById(req, res) {
    try {
        const { id } = req.params; // Trae los parametros de la URL

        // Busca la tarea en la base de datos por su ID o clave primaria
        const tarea = await taskModel.findByPk(id);

        // Si no encuentra la tarea, devuelve un error 404
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Devolvemos la tarea encontrada como respuesta, convertida en JSON
        res.json(tarea);

    } catch (error) {
        console.error(error); // Si hay un error, lo mostramos convertido en texto
        res.status(500).json({ error: 'Error al obtener la tarea' });
    }
}

// // Ruta PUT para modificar solo la descripción y fecha de entrega de una tarea
// router.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params; //Trae los parametros de la URL
//     const { description, delivery_date } = req.body; //Trae el body de la peticion

//     //Busca la tarea en la base de datos por su ID o clave primaria
//     const taskModel = await taskModel.findByPk(id);

//     //Si no encuentra la tarea, devuelve un error 404
//     if (!taskModel) {
//       return res.status(404).json({ error: 'Tarea no encontrada' });
//     }

//     // Solo actualizamos los campos permitidos, evitando que la base de datos pida el title y la priority obligatoriamente
//     if(description) taskModel.description = description;
//     if(delivery_date) taskModel.delivery_date = delivery_date;

//     // Guardamos los cambios en la base de datos
//     await taskModel.save();

//     // Devolvemos la tarea actualizada como respuesta, convertida en JSON
//     res.json({ mensaje: 'Tarea actualizada correctamente', taskModel });

//   } catch (error) {
//     console.error(error); //Si hay un error, lo mostramos convertido en texto
//     res.status(500).json({ error: 'Error al actualizar la tarea' });
//   }
// });


// Exportamos este router para que pueda ser usado en app.js o index.js
module.exports = {
    newTask,
    getTasks,
    getTaskById,
    // updateTask
};

/*¿Dónde se conecta esto?
En tu archivo app.js o server.js, lo usás así:

const express = require('express');
const app = express();
const tareasRoutes = require('./routes/taskModels'); // ruta a este archivo

app.use(express.json()); // Middleware para leer JSON en las peticiones
app.use('/api/taskModels', tareasRoutes); // Tu ruta queda activa en /api/tareas

Entonces, si tu frontend hace un POST a http://localhost:3000/api/tareas, 
este endpoint va a procesar la solicitud y crear la tarea en PostgreSQL.

*/
