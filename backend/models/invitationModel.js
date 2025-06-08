// Módulo: Invitation (Invitación a Grupo)

// Importaciones requeridas para el modelo
const { DataTypes } = require('sequelize'); // Tipos de datos de Sequelize
const sequelize = require('../config/sequelize'); // Instancia configurada de Sequelize

/**
 * Modelo Invitation - Gestiona las invitaciones a grupos
 * Registra solicitudes de ingreso a grupos, su estado y metadatos asociados
 * Permite el control de invitaciones por email con token de seguridad y fecha de expiración
 */
const Invitation = sequelize.define('Invitation', {
    // ID único autoincremental como clave primaria
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // ID del grupo al que se invita (clave foránea obligatoria)
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Requerido
        references: {
            model: 'groups', // Relación con tabla groups
            key: 'id'       // Referencia a la clave primaria
        }
    },

    // ID del usuario que realiza la invitación (clave foránea obligatoria)
    invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: false, // Requerido
        references: {
            model: 'users', // Relación con tabla users
            key: 'id'      // Referencia a la clave primaria
        }
    },

    // Email del usuario invitado (validado como formato email)
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Requerido
        validate: {
            isEmail: true // Validación de formato de email
        }
    },

    // Estado actual de la invitación
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'), // Valores permitidos
        defaultValue: 'pending' // Estado inicial
    },

    // Token único para identificación segura de la invitación
    token: {
        type: DataTypes.STRING,
        unique: true,    // Debe ser único en la base de datos
        allowNull: false // Requerido
    },

    // Fecha de expiración de la invitación
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false // Requerido
    },

    // Fecha de aceptación (se completa cuando cambia el estado)
    acceptedAt: {
        type: DataTypes.DATE // Opcional, solo para invitaciones aceptadas
    }
}, {
    // Configuraciones adicionales del modelo

    tableName: 'invitations', // Nombre real de la tabla en BD
    timestamps: true,         // Habilita campos createdAt y updatedAt
    underscored: true,        // Usa snake_case para nombres de columnas
});

// Exporta el modelo para uso en controladores y servicios
module.exports = Invitation;