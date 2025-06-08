// Modulo de Grupo

// Importación de tipos de datos de Sequelize
const { DataTypes } = require('sequelize');

// Importación de la instancia configurada de Sequelize
const sequelize = require('../config/sequelize');

/**
 * Modelo Group - Representa un grupo en el sistema
 * Almacena información básica del grupo, su administrador y código de invitación
 */
const Group = sequelize.define('Group', {
    // ID único autoincremental como clave primaria
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Nombre del grupo (campo obligatorio)
    name: {
        type: DataTypes.STRING,        // Tipo cadena de texto
        allowNull: false               // No puede ser nulo
    },

    // Descripción opcional del grupo
    description: {
        type: DataTypes.STRING         // Tipo cadena de texto
        // allowNull: true por defecto (campo opcional)
    },

    // ID del usuario administrador del grupo (clave foránea)
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,             // Campo obligatorio
        references: {
            model: 'users',           // Tabla referenciada
            key: 'id'                 // Clave primaria en la tabla users
        }
    },

    // Código único de invitación al grupo
    inviteCode: {
        type: DataTypes.STRING,
        unique: true,                 // Valor único en la tabla
        allowNull: false              // Campo obligatorio
    }
}, {
    // Configuraciones adicionales del modelo

    tableName: 'groups',      // Nombre real de la tabla en la BD
    timestamps: true,        // Habilita campos createdAt y updatedAt
    underscored: true        // Usa snake_case para nombres de columnas
});

// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Group;