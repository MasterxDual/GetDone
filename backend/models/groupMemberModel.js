// Modelo para Miembro de un Grupo

// Importación de tipos de datos de Sequelize
const { DataTypes } = require('sequelize');

// Importación de la instancia de Sequelize configurada
const sequelize = require('../config/sequelize');

/**
 * Modelo GroupMember - Representa la relación entre usuarios y grupos
 * Registra la membresía de usuarios en grupos con su rol y estado
 */
const GroupMember = sequelize.define('GroupMember', {
    // ID único autoincremental como clave primaria
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // ID del grupo al que pertenece el miembro (clave foránea)
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Campo obligatorio
        references: {
            model: 'groups', // Nombre de la tabla referenciada
            key: 'id'        // Clave primaria en la tabla referenciada
        }
    },

    // ID del usuario miembro (clave foránea)
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Campo obligatorio
        references: {
            model: 'users', // Nombre de la tabla referenciada
            key: 'id'       // Clave primaria en la tabla referenciada
        }
    },

    // Rol del usuario en el grupo (admin o member)
    role: {
        type: DataTypes.ENUM('admin', 'member'), // Solo permite estos valores
        allowNull: false, // Campo obligatorio
        defaultValue: 'member' // Valor por defecto si no se especifica
    },

    // Fecha de unión al grupo (se establece automáticamente)
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Fecha actual por defecto
    },

    // Bandera para membresías activas/inactivas (posible eliminación)
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Por defecto la membresía está activa
    }
}, {
    // Configuraciones adicionales del modelo

    tableName: 'group_members', // Nombre real de la tabla en la base de datos
    timestamps: true,           // Habilita campos createdAt y updatedAt automáticos
    underscored: true,          // Usa snake_case para los nombres de columnas

    // Índices para optimización de consultas
    indexes: [
        {
            unique: true, // Restricción de unicidad
            fields: ['group_id', 'user_id'] // Un usuario solo puede tener una membresía por grupo
        }
    ]
});

// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = GroupMember;