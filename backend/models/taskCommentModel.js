// Módulo: TaskComment (Comentarios de Tareas)

// Importaciones requeridas para el modelo
const { DataTypes } = require('sequelize');  // Tipos de datos de Sequelize
const sequelize = require('../config/sequelize');  // Conexión configurada a la base de datos

/**
 * Modelo TaskComment - Gestiona los comentarios asociados a tareas
 * Establece relación entre usuarios, tareas y sus comentarios
 * Registra el contenido de comentarios con trazabilidad de autor y tarea asociada
 */
const TaskComment = sequelize.define('TaskComment', {
    // ID único autoincremental como clave primaria
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // ID de la tarea asociada (clave foránea obligatoria)
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Campo requerido
        references: {
            model: 'tasks',  // Relación con la tabla tasks
            key: 'id'       // Referencia a la clave primaria
        }
    },

    // ID del usuario autor del comentario (clave foránea obligatoria)
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Campo requerido
        references: {
            model: 'users',  // Relación con la tabla users
            key: 'id'       // Referencia a la clave primaria
        }
    },

    // Contenido textual del comentario
    comment: {
        type: DataTypes.STRING,
        allowNull: false,  // Campo requerido
        validate: {
            notEmpty: true  // Validación para evitar comentarios vacíos
        }
    }
}, {
    // Configuraciones adicionales del modelo

    tableName: 'task_comment',  // Nombre físico de la tabla en la base de datos
    timestamps: true,           // Habilita automáticamente createdAt y updatedAt
    underscored: true,          // Usa snake_case para nombres de columnas

});

// Exporta el modelo para su uso en:
// - Controladores de tareas
// - Servicios de comentarios
// - Rutas relacionadas
module.exports = TaskComment;