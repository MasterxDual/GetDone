// Controlador: taskController.js
// Descripción: Maneja todas las operaciones relacionadas con tareas y sus comentarios
// Responsabilidades:
// - Creación/gestión de tareas
// - Manejo de comentarios en tareas
// - Cambio de estados (completado)
// - Validación de permisos

// Importación de modelos requeridos
const GroupMember = require('../models/groupMemberModel'); // Modelo de membresías de grupo
const taskModel = require('../models/taskModel');          // Modelo principal de tareas
const TaskComment = require('../models/taskCommentModel'); // Modelo de comentarios
const { Op } = require('sequelize'); // Operadores de Sequelize para consultas complejas

/**
 * @function newTask
 * @description Crea una nueva tarea con validación de permisos de administrador
 * @param {Object} req - Request de Express con:
 *   - body: { title, description, delivery_date, priority, groupId, assignedTo }
 *   - user: { id } (usuario autenticado)
 * @param {Object} res - Response de Express
 * @returns {Object} JSON con la tarea creada o mensaje de error
 * @throws {403} Si el usuario no es admin del grupo
 * @throws {400} Si faltan campos obligatorios
 * @throws {500} Error interno del servidor
 */
async function newTask(req, res) {
    try {
        // Validación de permisos: el usuario debe ser admin del grupo
        const membership = await GroupMember.findOne({
            where: {
                groupId: req.body.groupId,
                userId: req.user.id,
                // role: 'admin' // Comentado para propósitos de testing
            }
        });
        
        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ 
                error: 'No tienes permiso para crear tareas en este grupo' 
            });
        }

        // Extracción y validación de campos obligatorios
        const { title, description, delivery_date, priority, groupId, assignedTo } = req.body;
        const assignedBy = req.user.id; // ID del usuario que asigna la tarea
        const status = 'pending'; // Valor por defecto para el estado de la tarea

        if (!title || !groupId || !assignedTo) {
            return res.status(400).json({ 
                message: 'title, groupId y assignedTo son obligatorios' 
            });
        }

        // Creación de la tarea en la base de datos
        const tarea = await taskModel.create({
          title,
          description,
          delivery_date,
          priority,
          groupId,
          assignedBy,
          assignedTo,
          status,
          completedAt: null,
          createdAt: new Date(),         // Timestamps manuales
          updatedAt: new Date()
        });

        res.status(201).json({ 
            message: 'Tarea creada', 
            tarea 
        });
    } catch (err) {
        console.error('Error en newTask:', err);
        res.status(500).json({ 
            error: 'Error al crear tarea',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

/**
 * @function addComment
 * @description Añade un comentario a una tarea con validación de membresía
 * @param {Object} req - Request con:
 *   - params: { taskId }
 *   - body: { comment }
 *   - user: { id }
 * @param {Object} res - Response
 * @returns {Object} JSON con el comentario creado
 * @throws {400} Si el comentario está vacío
 * @throws {404} Si la tarea no existe
 * @throws {403} Si el usuario no es miembro del grupo
 */
async function addComment(req, res) {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;
        const { comment } = req.body;

        // Validación básica del comentario
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ 
                message: 'El comentario no puede estar vacío' 
            });
        }

        // Verificación de existencia de la tarea
        const task = await taskModel.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ 
                message: 'Tarea no encontrada' 
            });
        }

        // Validación de membresía activa en el grupo
        const membership = await GroupMember.findOne({
            where: {
                groupId: task.groupId,
                userId,
                isActive: true
            }
        });

        if (!membership) {
            return res.status(403).json({ 
                message: 'No tienes permiso para comentar esta tarea' 
            });
        }

        // Creación del comentario
        const newComment = await TaskComment.create({
            taskId,
            userId,
            comment: comment.trim() // Limpieza básica del input
        });

        res.status(201).json({ 
            message: 'Comentario agregado', 
            comment: newComment 
        });
    } catch (error) {
        console.error('Error en addComment:', error);
        res.status(500).json({ 
            message: 'Error al agregar comentario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @function getTasks
 * @description Obtiene tareas con filtros opcionales (grupo o asignado)
 * @param {Object} req - Request con query params:
 *   - groupId: Filtrar por grupo específico
 *   - assignedTo: Filtrar por usuario asignado
 * @param {Object} res - Response
 * @returns {Object} JSON con array de tareas
 * @throws {500} Error interno del servidor
 */
async function getTasks(req, res) {
    try {
        const { groupId, assignedTo } = req.query;
        const where = {};
        
        // Construcción dinámica del WHERE clause
        if (groupId) where.groupId = groupId;
        if (assignedTo) where.assignedTo = assignedTo;

        const tareas = await taskModel.findAll({ 
            where,
            // Podría añadirse paginación:
            // limit: parseInt(req.query.limit) || 20,
            // offset: parseInt(req.query.offset) || 0
        });

        res.json(tareas);
    } catch (err) {
        console.error('Error en getTasks:', err);
        res.status(500).json({ 
            error: 'Error al obtener tareas',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

/**
 * @function getTaskById
 * @description Obtiene una tarea específica por ID
 * @param {Object} req - Request con:
 *   - params: { id } (ID de la tarea)
 * @param {Object} res - Response
 * @returns {Object} JSON con la tarea
 * @throws {404} Si la tarea no existe
 * @throws {500} Error interno
 */
async function getTaskById(req, res) {
    try {
        const { id } = req.params;
        const tarea = await taskModel.findByPk(id);

        if (!tarea) {
            return res.status(404).json({ 
                error: 'Tarea no encontrada',
                suggestedActions: ['Verificar el ID', 'Consultar lista completa con /tasks']
            });
        }

        res.json(tarea);
    } catch (error) {
        console.error('Error en getTaskById:', error);
        res.status(500).json({ 
            error: 'Error al obtener la tarea',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}


async function updateTask(req, res) {
  try {
    const { id } = req.params; // ID de la tarea desde los parámetros de la URL
    const { completed } = req.body; // Campo `completed` desde el cuerpo de la solicitud

    // Validar que el campo `completed` sea booleano
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'El campo "completed" debe ser true o false.' });
    }

    // Buscar la tarea en la base de datos
    const task = await taskModel.findByPk(id);

    // Si no se encuentra la tarea, devolver un error 404
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    // Actualizar el campo `completed`
    task.completed = completed;
    await task.save();

    // Responder con la tarea actualizada
    res.json({ mensaje: 'Tarea actualizada correctamente.', task });
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// // Ruta PUT para modificar solo la descripción y fecha de entrega de una tarea
// router.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params; //Trae los parametros de la URL
//     const { description, delivery_date } = req.body; //Trae el body de la peticion

/**
 * @function getComments
 * @description Obtiene todos los comentarios de una tarea ordenados cronológicamente
 * @param {Object} req - Request con:
 *   - params: { taskId }
 * @param {Object} res - Response
 * @returns {Object} JSON con array de comentarios
 * @throws {500} Error interno
 */
async function getComments(req, res) {
    try {
        const { taskId } = req.params;

        const comments = await TaskComment.findAll({
            where: { taskId },
            order: [['createdAt', 'ASC']], // Orden ascendente por fecha
            // Podría incluirse información del usuario:
            // include: [{ model: User, attributes: ['id', 'name'] }]
        });

        res.json(comments);
    } catch (error) {
        console.error('Error en getComments:', error);
        res.status(500).json({ 
            message: 'Error al obtener comentarios',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @function markComplete
 * @description Marca una tarea como completada con validación de permisos
 * @param {Object} req - Request con:
 *   - params: { taskId }
 *   - user: { id }
 * @param {Object} res - Response
 * @returns {Object} JSON con la tarea actualizada
 * @throws {404} Si la tarea no existe
 * @throws {403} Si el usuario no tiene permisos
 * @throws {500} Error interno
 */
async function markComplete(req, res) {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        const task = await taskModel.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ 
                message: 'Tarea no encontrada',
                recoverySuggestion: 'Verificar el ID en /tasks'
            });
        }

        // Validación de membresía activa
        const membership = await GroupMember.findOne({
            where: {
                groupId: task.groupId,
                userId,
                isActive: true
            }
        });

        if (!membership) {
            return res.status(403).json({ 
                message: 'No tienes permiso para modificar esta tarea',
                requiredRole: 'Miembro activo del grupo'
            });
        }

        // Actualización atómica del estado
        const [affectedRows] = await taskModel.update(
            { 
                status: 'completada',
                completedAt: new Date() 
            },
            { 
                where: { id: taskId },
                returning: true // Para PostgreSQL
            }
        );

        if (affectedRows === 0) {
            throw new Error('Ninguna fila actualizada');
        }

        res.json({ 
            message: 'Tarea marcada como completada',
            task: await taskModel.findByPk(taskId) // Devuelve la versión actualizada
        });
    } catch (error) {
        console.error('Error en markComplete:', error);
        res.status(500).json({ 
            message: 'Error al marcar tarea como completada',
            technicalDetails: process.env.NODE_ENV === 'development' ? {
                error: error.message,
                stack: error.stack
            } : undefined
        });
    }
}

/**
 * @function searchTasks
 * @description Controlador para buscar tareas según un término de búsqueda.
 * @async
 * @param {Object} req - Objeto de solicitud HTTP (Express).
 * @param {Object} res - Objeto de respuesta HTTP (Express).
 * @returns {JSON} Lista de tareas que coincidan con el término buscado.
 *
 * @example
 * // GET /api/tasks/search?query=importante
 * // Devuelve hasta 10 tareas cuyo nombre contenga "importante" (insensible a mayúsculas).
 *
 * @behavior
 * - Extrae el término de búsqueda desde `req.query.query`.
 * - Realiza una búsqueda parcial insensible a mayúsculas (`ILIKE`) en el campo `name`.
 * - Limita los resultados a un máximo de 10 tareas.
 * - Ordena alfabéticamente las tareas por su nombre.
 *
 * @error
 * - Si ocurre un error en la consulta a la base de datos, responde con status 500 y un mensaje de error.
 */
async function searchTasks(req, res) {
    const query = req.query.query || '';
    const groupId = req.query.groupId; // <-- obtiene el groupId si viene en la URL

    try {
        // Construye el filtro dinámico
        const where = {
            title: {
                [Op.iLike]: `%${query}%` // Búsqueda insensible a mayúsculas
            }
        };
        // Si viene groupId, lo agrega al filtro
        if (groupId) {
            where.groupId = groupId;
        }

        const tasks = await taskModel.findAll({
            where,
            limit: 10,
            order: [['title', 'ASC']]
        });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar tareas' });
    }
};

// Exportación de funciones del controlador
module.exports = {
    newTask,
    getTasks,
    getTaskById,
    updateTask,
    addComment,
    getComments,
    markComplete,
    searchTasks
};

/* Configuración de ruteo recomendada:
   const router = express.Router();
   router.post('/tasks', taskController.newTask);
   router.get('/tasks/:id/comments', taskController.getComments);
   ...
   app.use('/api/v1', router);
*/