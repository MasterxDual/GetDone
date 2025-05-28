// Modulo de invitacion a un grupo

const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelize');

const Invitation = sequelize.define('Invitation', {
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
    invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // 
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending'
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    acceptedAt: {
        type: DataTypes.DATE,
    }
}, {
    tableName: 'invitations',
    timestamps: true,
    underscored: true
});


module.exports = Invitation;  // Exporta el modelo.