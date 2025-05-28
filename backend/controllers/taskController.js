// Controlador de tareas

// Importamos el modelo 'taskModel' desde la carpeta de modelos
// Este modelo está vinculado a la tabla de PostgreSQL
const GroupMember = require('../models/groupMemberModel');
const taskModel = require('../models/taskModel');
const TaskComment = require('../models/taskCommentModel');

/**
 * Controlador para registrar una nueva tarea
 * @param {Object} req - Objeto de solicitud HTTP (contiene los datos de la tarea en el body)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} - Respuesta JSON con el resultado de la operación
 */
async function newTask(req, res) {
    try {
        // Antes de crear una tarea, verificamos que el usuario sea administrador del grupo
        const membership = await GroupMember.findOne({
            where: {
                groupId: req.body.groupId, // El ID del grupo debe coincidir con el enviado en el body
                userId: req.user.id, // El ID del usuario autenticado debe coincidir
                // role: 'admin' // Solo los administradores pueden crear tareas
            }
        });
        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para crear tareas en este grupo' });
        }
        

        // Extraemos los campos enviados en el body del formulario (HTML o JSON)
        const { title, description, delivery_date, priority, groupId, assignedTo, status, completedAt } = req.body;
        const assignedBy = req.user.id; // Asumiendo que el usuario autenticado está en req.user

        if (!title || !groupId || !assignedTo) {
            return res.status(400).json({ message: 'title, groupId y assignedTo son obligatorios' });
        }

        // Creamos una nueva tarea en la base de datos usando Sequelize
        const tarea = await taskModel.create({
            title,
            description,
            delivery_date,
            priority,
            groupId,
            assignedBy,
            assignedTo,
            status: status || 'pending',
            completedAt: completedAt || null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Respondemos con estado 201 (creado) y la tarea generada
        res.status(201).json({ message: 'Tarea creada', tarea });
    } catch (err) {
        // Si ocurre un error en la base de datos o en los datos enviados, lo capturamos
        console.error(err);

        // Enviamos un error genérico
        res.status(500).json({ error: 'Error al crear tarea' });
    }
}

/**
 * Controlador para crear un comentario en una tarea
 */
async function addComment(req, res) {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: 'El comentario es obligatorio' });
        }

        // Verificar que el usuario sea miembro activo del grupo de la tarea
        const task = await taskModel.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        const membership = await GroupMember.findOne({
            where: {
                groupId: task.groupId,
                userId,
                isActive: true
            }
        });

        if (!membership) {
            return res.status(403).json({ message: 'No tienes permiso para comentar esta tarea' });
        }

        // Crear el comentario
        const newComment = await TaskComment.create({
            taskId,
            userId,
            comment
        });

        res.status(201).json({ message: 'Comentario agregado', comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar comentario' });
    }
}

/**
 * Controlador para obtener comentarios de una tarea
 */
async function getComments(req, res) {
    try {
        const { taskId } = req.params;

        const comments = await TaskComment.findAll({
            where: { taskId },
            order: [['createdAt', 'ASC']]
        });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener comentarios' });
    }
}

/**
 * Controlador para marcar una tarea como completada
 */
async function markComplete(req, res) {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        // Verificar que el usuario sea miembro activo del grupo de la tarea
        const task = await taskModel.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        const membership = await GroupMember.findOne({
            where: {
                groupId: task.groupId,
                userId,
                isActive: true
            }
        });

        if (!membership) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta tarea' });
        }

        // Actualizar estado y fecha de completado
        task.status = 'completada';
        task.completedAt = new Date();
        await task.save();

        res.json({ message: 'Tarea marcada como completada', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al marcar tarea como completada' });
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
        const { groupId, assignedTo } = req.query;

        // const userId = req.user.id; // El usuario autenticado

        const where = {};
        if (groupId) where.groupId = groupId;
        if (assignedTo) where.assignedTo = assignedTo;

        // Consultamos todas las tareas usando Sequelize con una condicion
        const tareas = await taskModel.findAll({ where });

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


// Exportamos este router para que pueda ser usado en app.js o index.js
module.exports = {
    newTask,
    getTasks,
    getTaskById,
    addComment,
    getComments,
    markComplete,
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
