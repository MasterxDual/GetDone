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
const Group = require('../models/groupModel'); // Modelo de grupos
const { User } = require('../models/userModel'); // Modelo de usuarios
const Notification = require('../models/notificationModel'); // Modelo de notificaciones
const { sendAssignmentEmail, sendDateChangedEmail } = require('./emailController');
const Sequelize = require('sequelize'); // Importa Sequelize para operaciones avanzadas

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

        /* Envía el email al usuario al cual fue asignada la tarea */
        const assignedUser = await User.findByPk(assignedTo);

        if(assignedUser && assignedUser.email) {
            await sendAssignmentEmail(assignedUser.email, tarea)

            // Crea una notificación en la base de datos si se asignó una nueva tarea
            await Notification.create({
                userId: assignedTo,
                type: 'assignment',
                taskId: tarea.id,
                groupId: groupId,
                role: membership.role, 
                message: `Tarea "${tarea.title}" asignada a ti.`,
                isRead: false
            });
        }

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
 * @description Obtiene tareas con filtros opcionales (grupo o asignado). Verifica si la tarea está por expirar.
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
        const today = new Date();

        // Parametros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        
        // Parametros de ordenamiento
        const orderField = req.query.orderBy || 'createdAt'; // Campo por defecto
        const orderDirection = ['ASC', 'DESC'].includes(req.query.orderDirection) ? req.query.orderDirection : 'DESC';
        let order;
        let orderBy;
        
        // Mapeo de campos visibles a nombres reales (para Sequelize)
        const fieldMap = {
          createdAt: 'created_at',
          delivery_date: 'delivery_date',
          priority: 'priority'
        };
        const allowedOrderFields = Object.keys(fieldMap);

        if(orderField === 'priority') {
            // Si se ordena por prioridad, usamos un CASE para asignar valores numéricos en la base de datos y así ordenar correctamente
            order = [[Sequelize.literal(`
              CASE priority
                WHEN 'Alta' THEN 3
                WHEN 'Media' THEN 2
                WHEN 'Baja' THEN 1
                ELSE 0
              END
            `), orderDirection]];
        } else {
            // Si se ordena por fecha de creación o fecha de vencimiento
            orderBy = allowedOrderFields.includes(req.query.orderBy) ? fieldMap[req.query.orderBy] : 'created_at';
            order = [[orderBy, orderDirection]];
        }

        // Filtros
        if (groupId) where.groupId = req.query.groupId;
        if (assignedTo) where.assignedTo = assignedTo;

        // Consulta paginada y conteo total
        const { rows: tareas, count: total } = await taskModel.findAndCountAll({
            where,
            limit,
            offset,
            order
        });

        //Actualización de estado de tareas que expiran pronto (1 día o menos)
        for (const task of tareas) {
          if (task.status === 'pending') {
            const dueDate = new Date(task.delivery_date);
            const diffTime = dueDate.getTime() - today.setHours(0,0,0,0);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 1 && diffDays >= 0) {
              // Actualiza status y guarda
              task.status = 'expiring-soon';
              await task.save();
            }
          }
        }

        // Devuelve tareas y datos de paginación
        res.json({
            tareas,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
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

/**
 * Actualiza el estado de una tarea existente en la base de datos.
 *
 * Puede actualizar los campos `completed` y `status`, y ajusta automáticamente
 * la fecha de finalización (`completedAt`) según corresponda.
 *
 * @async
 * @function updateTask
 * @param {Object} req - Objeto de solicitud (Express).
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - ID de la tarea a actualizar.
 * @param {Object} req.body - Cuerpo de la solicitud con los campos a modificar.
 * @param {boolean} [req.body.completed] - Estado booleano de finalización de la tarea.
 * @param {string} [req.body.status] - Estado textual de la tarea ("completed", "pending", etc.).
 * @param {Object} res - Objeto de respuesta (Express).
 * @returns {Promise<void>} Respuesta HTTP con el mensaje y los datos de la tarea actualizada,
 * o mensaje de error si ocurre algún problema.
 *
 * @throws {404} Si la tarea con el ID especificado no existe.
 * @throws {500} Si ocurre un error durante la actualización.
 */
async function updateTask(req, res) {
  const { id } = req.params;
  const { completed, status } = req.body; // completed es boolean, status es string

  try {
    const task = await taskModel.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Si completed está presente, actualiza status y completedAt
    if (typeof completed !== 'undefined') {
      task.status = completed ? 'completed' : 'pending';
      if (completed) {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    // Si status está presente, actualiza status (por compatibilidad)
    if (typeof status !== 'undefined') {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else if (status === 'pending') {
        task.completedAt = null;
      }
    }

    await task.save();

    res.json({ message: "Tarea actualizada correctamente", task });
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
}


/**
 * Obtiene los comentarios asociados a una tarea específica, incluyendo el nombre completo del autor
 * y su rol dentro del grupo al que pertenece la tarea.
 *
 * @async
 * @function getComments
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express, que debe incluir `taskId` en los parámetros de ruta.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express, usado para devolver el resultado en formato JSON.
 * 
 * @returns {Promise<void>} Devuelve una respuesta JSON con un arreglo de comentarios enriquecidos con nombre de usuario y rol.
 *
 * @throws {404} Si la tarea con el `taskId` proporcionado no existe.
 * @throws {500} Si ocurre un error durante la consulta a la base de datos.
 * 
 * @example
 * // Respuesta esperada:
 * [
 *   {
 *     id: 1,
 *     comment: "Esta es una nota",
 *     userId: 3,
 *     userName: "Juan Pérez",
 *     role: "admin"
 *   }
 * ]
 */
async function getComments(req, res) {
  const { taskId } = req.params;
  
  // 1. Buscar la tarea para obtener el groupId
  const task = await taskModel.findByPk(taskId);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
  const groupId = task.groupId;

  // 2. Buscar comentarios e incluir el usuario y el GroupMember con ese groupId
  const comments = await TaskComment.findAll({
    where: { taskId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
          model: GroupMember,
          as: 'groupMemberships',
          attributes: ['role'],
          where: { groupId } // Solo el rol en ese grupo
        }]
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  // 3. Construir el array de comentarios con nombre y rol
  const commentsWithUser = comments.map(comment => ({
    id: comment.id,
    comment: comment.comment,
    userId: comment.userId,
    userName: comment.author
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : `Usuario ${comment.userId}`,
    role: comment.author && comment.author.groupMemberships.length > 0
      ? comment.author.groupMemberships[0].role
      : 'Sin rol'
  }));

  res.json(commentsWithUser);
}

/**
 * Edita una tarea existente por su ID.
 * Solo el administrador del grupo puede realizar la modificación.
 * Si se modifica la fecha de vencimiento, se envía una notificación por correo electrónico al usuario.
 *
 * @async
 * @function editTask
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.id - ID de la tarea a editar.
 * @param {Object} req.body - Cuerpo de la solicitud con los campos editables.
 * @param {string} [req.body.description] - Nueva descripción de la tarea (opcional).
 * @param {string} [req.body.delivery_date] - Nueva fecha de entrega de la tarea (opcional, formato YYYY-MM-DD).
 * @param {Object} req.user - Objeto del usuario autenticado (inyectado por middleware).
 * @param {number} req.user.id - ID del usuario autenticado (extraído del token JWT).
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Retorna una respuesta JSON con la tarea editada o un mensaje de error.
 *
 * @throws {404} Si la tarea no existe.
 * @throws {403} Si el usuario no es administrador del grupo de la tarea.
 * @throws {500} Si ocurre un error en el servidor.
 *
 * @example
 * PUT /api/tasks/5
 * {
 *   "description": "Actualizar lógica de validación",
 *   "delivery_date": "2025-07-20"
 * }
 */
async function editTask(req, res) {
  const { id } = req.params;
  const { description, delivery_date } = req.body;
  const userId = req.user.id; // del JWT/session

  const task = await taskModel.findByPk(id);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  const membership = await GroupMember.findOne({
    where: { userId, groupId: task.groupId }
  });

  
  if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el admin puede editar esta tarea.' });
    }
    
    // Verifica si se cambió la fecha de vencimiento de la tarea a completar
    if(req.body.delivery_date && req.body.delivery_date !== task.delivery_date) {
        /* Solo trae la columna de email de la base de datos */
        const assignedUser = await User.findByPk(task.assignedTo, { attributes: ['email'] });
        // Enviar email: "La fecha de entrega de tu tarea ha sido modificada"
        await sendDateChangedEmail(assignedUser.email, task, req.body.delivery_date);

        // Crea una notificación en la base de datos si la fecha de entrega de la tarea fue modificada
        await Notification.create({
            userId: task.assignedTo,
            type: 'date_changed',
            taskId: id,
            groupId: task.groupId,
            role: membership.role,
            message: `Tarea "${task.title}" fue modificada.<br>Nueva fecha de entrega: ${req.body.delivery_date}.`,
            isRead: false
        });

        // Opcional: reiniciar flag para volver a enviar recordatorio cuando se acerque la fecha de vencimiento
        task.expiring_notification_sent = false;
  }

  task.description = description || task.description;
  task.delivery_date = delivery_date || task.delivery_date;

  /* OPCIÓN 1: RECALCULAR STATUS para que se contemple la actualización del estado en la BD y en la UI
  Esto corrije el error que sucedía al cambiar la fecha de vencimiento de una tarea en rojo a una tarea pendiente,
  quitando así el color rojo de la UI */
  const now = new Date();
  const due = new Date(task.delivery_date);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (task.completed) {
    task.status = 'completed';
  } else if (diffDays <= 1 && diffDays >= 0) {
    task.status = 'expiring-soon';
  } else {
    task.status = 'pending';
  }

  await task.save();

  res.json(task);
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
    const userId = req.user.id;
    const groupId = req.query.groupId;

    try {
        const where = {
            title: { [Op.iLike]: `%${query}%` },
            assignedTo: userId
        };
        if (groupId) { // Solo agrega groupId si existe
            where.groupId = groupId;
        }

        const tasks = await taskModel.findAll({
            where,
            limit: 10,
            order: [['title', 'ASC']]
        });

        res.json(tasks);
    } catch (err) {
        console.error('Error en searchTasks:', err);
        res.status(500).json({ error: 'Error al buscar tareas' });
    }
} 

/**
 * Elimina una tarea existente por su ID.
 *
 * Esta función maneja una solicitud HTTP DELETE para eliminar una tarea 
 * del sistema. El ID de la tarea se obtiene desde los parámetros de la URL.
 * 
 * Opcionalmente, se podría agregar validación de permisos del usuario.
 *
 * @async
 * @function deleteTask
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - ID de la tarea a eliminar.
 * @param {Object} res - Objeto de respuesta Express.
 * 
 * @returns {Promise<void>} Envía una respuesta JSON indicando si la tarea fue eliminada correctamente 
 * o si ocurrió un error.
 * 
 * @example
 * // DELETE /api/tasks/123
 * req.params.id = '123';
 * // Respuesta exitosa:
 * { message: 'Tarea eliminada correctamente' }
 *
 * // Si no se encuentra:
 * { message: 'Tarea no encontrada' }
 *
 * // Si ocurre un error interno:
 * { message: 'Error al eliminar la tarea' }
 */
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    // Opcional: validar permisos del usuario

    const deleted = await taskModel.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (err) {
    console.error('Error eliminando tarea:', err);
    res.status(500).json({ message: 'Error al eliminar la tarea' });
  }
}

// Exportación de funciones del controlador
module.exports = {
    newTask,
    getTasks,
    getTaskById,
    updateTask,
    addComment,
    getComments,
    markComplete,
    searchTasks,
    deleteTask,
    editTask
};

/* Configuración de ruteo recomendada:
   const router = express.Router();
   router.post('/tasks', taskController.newTask);
   router.get('/tasks/:id/comments', taskController.getComments);
   ...
   app.use('/api/v1', router);
*/