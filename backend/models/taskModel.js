// Modulo de Tareas

// Importamos los tipos de datos que Sequelize proporciona (STRING, DATE, ENUM, etc.)
const { DataTypes } = require('sequelize');

// Importamos la conexión configurada de Sequelize desde el archivo db.js
const sequelize = require('../config/sequelize');

// Definimos el modelo 'Tarea' usando sequelize.define()
// Este modelo representa una tabla llamada 'Tareas' en la base de datos (Sequelize pluraliza por defecto)
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Campo 'title' de tipo texto corto, obligatorio
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Campo 'description' de tipo texto largo, opcional
  description: {
    type: DataTypes.TEXT
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'expiring-soon'),
      defaultValue: 'pending'
  },
  // Campo 'delivery_date' para almacenar solo la fecha (sin hora), obligatorio
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Campo 'priority' con valores restringidos a Alta, Media o Baja
  priority: {
    type: DataTypes.ENUM('Alta', 'Media', 'Baja'),
    allowNull: false
  },
  // Campo 'completedAt' para almacenar la fecha de finalización, opcional
  completedAt: {
    type: DataTypes.DATE
  },
  // Campo 'expiring_notification_sent' para indicar si se ha enviado una notificación de vencimiento previamente
  expiring_notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Indica si se ha enviado la notificación de vencimiento
  }
}, { // Configuración adicional para el modelo

  tableName: 'tasks',             // Definimos el nombre de la tabla en la base de datos
  freezeTableName: true,          // Evita que Sequelize pluralice el nombre de la tabla (usará 'users' tal cual)
  underscored: true,              // Convierte camelCase a snake_case automáticamente (Nomenclatura de la base de datos)
  timestamps: true,               // Activamos timestamps automáticos, pero solo para createdAt
  createdAt: 'created_at',        // Renombramos el campo 'createdAt' a 'created_at' para que se vea más legible en PostgreSQL
  updatedAt: false                // Desactivamos el campo 'updatedAt' (no se necesita en este caso)
});

// Exportamos el modelo para poder usarlo en rutas, controladores o scripts
module.exports = Task;

/* Cuando se ejecuta sequelize.sync(), Sequelize crea (o actualiza) una tabla con la estructura definida anteriormente */
