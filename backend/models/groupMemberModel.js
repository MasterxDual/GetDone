// Modelo para Miembro de un Grupo

const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelize');

const GroupMember = sequelize.define('GroupMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
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
    role: {
        type: DataTypes.ENUM('admin', 'member'), // Roles posibles: admin o member
        allowNull: false,
        defaultValue: 'member' // Por defecto, el rol es 'member'
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Posible eliminacion:
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'group_members',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['group_id', 'user_id']
        }
    ]
});


module.exports = GroupMember;  // Exportamos la clase GroupMember para poder usarla en otros archivos.