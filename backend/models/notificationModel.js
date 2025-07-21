// Modulo de Tareas

// Importamos los tipos de datos que Sequelize proporciona (STRING, DATE, ENUM, etc.)
const { DataTypes } = require('sequelize');

// Importamos la conexión configurada de Sequelize desde el archivo db.js
const sequelize = require('../config/sequelize');

// Definimos el modelo 'Notificacion' usando sequelize.define()
// Este modelo representa una tabla llamada 'Notificaciones' en la base de datos (Sequelize pluraliza por defecto)
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: { // 'expiring', 'date_changed', 'assignment'
    type: DataTypes.STRING,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: { // Para saber si ya la vio el usuario
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
    tableName: 'notifications',             // Definimos el nombre de la tabla en la base de datos
    freezeTableName: true,          // Evita que Sequelize pluralice el nombre de la tabla (usará 'users' tal cual)
    underscored: true,              // Convierte camelCase a snake_case automáticamente (Nomenclatura de la base de datos)
    timestamps: true,               // Activamos timestamps automáticos, pero solo para createdAt
    createdAt: 'created_at',        // Renombramos el campo 'createdAt' a 'created_at' para que se vea más legible en PostgreSQL
    updatedAt: false                // Desactivamos el campo 'updatedAt' (no se necesita en este caso)
});

// Exporta el modelo para su uso en:
// - Controladores de tareas
// - Servicios de comentarios
// - Rutas relacionadas
module.exports = Notification;