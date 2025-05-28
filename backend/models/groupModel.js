// Modulo de Grupo

const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelize')

// Definición del modelo
const Group = sequelize.define('Group', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    inviteCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
}, {
    tableName: 'groups',
    timestamps: true,
    underscored: true
});


module.exports = Group;  // Exportando o modelo de grupo para uso em outras partes do projeto