// Modulo para Comentarios de una Tarea

const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelize');

const TaskComment = sequelize.define('TaskComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
     taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        }
     },
     userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
     },
     comment: {
        type: DataTypes.STRING,
        allowNull: false
     }
}, {
    tableName: 'task_comment',
    timestamps: true,
    underscored: true
});

module.exports = TaskComment ;  // Exportar el modelo de la Tarea