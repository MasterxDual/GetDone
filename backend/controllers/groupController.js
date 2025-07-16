// Controlador para la gestión de grupos

// Importación de modelos necesarios para las operaciones con grupos
const { Group, GroupMember, Invitation, User } = require('../models/associationsModel');
// Operadores de Sequelize para consultas complejas
const { Op } = require('sequelize');
// Módulo crypto para generación de códigos seguros
const crypto = require('crypto');


/**
 * Crear un nuevo grupo con el usuario creador como administrador
 */
async function createGroup(req, res) {
    try {
        // Extraer nombre y descripción del cuerpo de la petición
        const { name, description } = req.body;
        // Obtener ID del usuario autenticado (debe venir del middleware de autenticación)
        const adminId = req.user.id;

        // Validar que se haya proporcionado un nombre para el grupo
        if (!name) {
            return res.status(400).json({ message: 'El nombre del grupo es obligatorio' });
        }

        // Generar un código de invitación único de 4 bytes en formato hexadecimal
        // TODO: Falta validar que otro grupo no tenga el mismo código
        const inviteCode = crypto.randomBytes(4).toString('hex');

        // Crear el registro del grupo en la base de datos
        const group = await Group.create({
            name,
            description,
            adminId,
            inviteCode
        });

        // Registrar al creador como miembro activo y administrador del grupo
        await GroupMember.create({
            groupId: group.id,
            userId: adminId,
            role: 'admin', // Rol de administrador para el creador
            joinedAt: new Date(), // Fecha actual como fecha de ingreso
            isActive: true // Estado activo
        });

        // Respuesta exitosa con los datos del grupo creado
        res.status(201).json({ message: 'Grupo creado exitosamente', group });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al crear el grupo' });
    }
}

/**
 * Permitir que un usuario se una a un grupo mediante código de invitación
 */
async function joinGroup(req, res) {
    try {
        // Obtener código de invitación del cuerpo de la petición
        const { inviteCode } = req.body;
        // ID del usuario autenticado que quiere unirse
        const userId = req.user.id;

        // Validar que se haya proporcionado el código de invitación
        if (!inviteCode) {
            return res.status(400).json({ message: 'El código de invitación es obligatorio' });
        }

        // Buscar el grupo que coincida con el código de invitación
        const group = await Group.findOne({ where: { inviteCode } });
        if (!group) {
            return res.status(404).json({ message: 'Código de invitación inválido' });
        }

        // Verificar si el usuario ya es miembro activo del grupo
        const existingMembership = await GroupMember.findOne({
            where: {
                groupId: group.id,
                userId,
                role: 'member', // Solo verifica para miembros (no administradores)
                isActive: true
            }
        });

        // Si ya es miembro activo, retornar error
        if (existingMembership) {
            return res.status(400).json({ message: 'Ya eres miembro activo de este grupo' });
        }

        // Crear el registro de membresía para el usuario
        const membership = await GroupMember.create({
            groupId: group.id,
            userId,
            joinedAt: new Date(), // Fecha actual como fecha de ingreso
            isActive: true // Estado activo
        });

        // Respuesta exitosa con los datos de la membresía
        res.status(200).json({ message: 'Te has unido al grupo exitosamente', membership });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al unirse al grupo' });
    }
}

/**
 * Listar los grupos a los que pertenece un usuario
 */
async function getUserGroups(req, res) {
    try {
        // ID del usuario autenticado
        const userId = req.user.id;

        // Buscar todos los grupos donde el usuario sea miembro activo
        const groups = await Group.findAll({
            include: [{
                model: GroupMember,
                as: 'memberships',
                where: { userId, isActive: true },
                attributes: ['role']  // Incluir solo el atributo 'role' de la membresía
            }]
        });

        // Mapear los resultados para devolver una estructura más limpia
        const result = groups.map(group => {
            const membership = group.memberships[0];
            return {
                id: group.id,
                name: group.name,
                description: group.description,
                inviteCode: group.inviteCode,
                role: membership ? membership.role : null // Incluir el rol del usuario en el grupo
            };
        });

        // Devolver la lista de grupos formateada
        res.json(result);
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los grupos del usuario' });
    }
}

/**
 * Enviar invitación para unirse a un grupo
 */
async function inviteUser(req, res) {
    try {
        // Extraer datos de la petición
        const { groupId, email } = req.body;
        // ID del usuario que realiza la invitación (debe ser admin del grupo)
        const invitedBy = req.user.id;

        // Validar parámetros requeridos
        if (!groupId || !email) {
            return res.status(400).json({ message: 'groupId y email son obligatorios' });
        }

        // Buscar el grupo y verificar que exista
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }
        
        // Verificar que el usuario que invita sea el administrador del grupo
        if (group.adminId !== invitedBy) {
            return res.status(403).json({ message: 'Solo el administrador puede enviar invitaciones' });
        }

        // Generar token único para la invitación (16 bytes en hexadecimal)
        const token = crypto.randomBytes(16).toString('hex');
        // Establecer fecha de expiración (7 días a partir de ahora)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Crear el registro de la invitación en la base de datos
        const invitation = await Invitation.create({
            groupId,
            invitedBy,
            email,
            status: 'pending', // Estado inicial
            token,
            expiresAt,
            createdAt: new Date() // Fecha actual
        });

        // En un caso real, aquí se enviaría un email con el token de invitación

        // Respuesta exitosa con los datos de la invitación
        res.status(201).json({ message: 'Invitación enviada', invitation });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al enviar la invitación' });
    }
}

/**
 * Aceptar una invitación mediante token
 */
async function acceptInvitation(req, res) {
    try {
        // Obtener token del cuerpo de la petición
        const { token } = req.body;
        // ID del usuario que acepta la invitación
        const userId = req.user.id;

        // Validar que se haya proporcionado el token
        if (!token) {
            return res.status(400).json({ message: 'Token de invitación es obligatorio' });
        }

        // Buscar la invitación que coincida con el token, esté pendiente y no haya expirado
        const invitation = await Invitation.findOne({
            where: {
                token,
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() } // Fecha de expiración mayor a ahora
            }
        });

        // Si no se encuentra invitación válida
        if (!invitation) {
            return res.status(404).json({ message: 'Invitación inválida o expirada' });
        }

        // Verificar si el usuario ya es miembro activo del grupo
        const existingMembership = await GroupMember.findOne({
            where: {
                groupId: invitation.groupId,
                userId,
                isActive: true
            }
        });

        // Si ya es miembro, retornar error
        if (existingMembership) {
            return res.status(400).json({ message: 'Ya eres miembro activo de este grupo' });
        }

        // Registrar al usuario como nuevo miembro del grupo
        await GroupMember.create({
            groupId: invitation.groupId,
            userId,
            joinedAt: new Date(), // Fecha actual como fecha de ingreso
            isActive: true // Estado activo
        });

        // Actualizar el estado de la invitación a "aceptada"
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date(); // Registrar fecha de aceptación
        await invitation.save();

        // Respuesta exitosa
        res.status(200).json({ message: 'Invitación aceptada, ahora eres miembro del grupo' });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al aceptar la invitación' });
    }
}

/**
 * Obtener información de un grupo específico por su ID
 */
async function getGroupById(req, res) {
    try {
        // Obtener ID del grupo de los parámetros de la ruta
        const groupId = req.params.id;
        // ID del usuario autenticado
        const userId = req.user.id;

        // Buscar el grupo por su ID primario
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        // Buscar información de membresía del usuario en este grupo
        const membership = await GroupMember.findOne({
            where: {
                groupId: group.id,
                userId
            }
        });

        // Determinar el rol del usuario en el grupo (null si no es miembro)
        const role = membership ? membership.role : null;

        // Devolver información del grupo junto con el rol del usuario
        res.json({
            id: group.id,
            name: group.name,
            description: group.description,
            adminId: group.adminId,
            inviteCode: group.inviteCode,
            role: role
        });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el grupo' });
    }
}

/**
 * Obtener los integrantes de un grupo (solo admin)
 */
async function getGroupMembers(req, res) {
    try {
        // Obtener ID del grupo de los parámetros de la ruta
        const groupId = req.params.id;
        // ID del usuario autenticado
        const userId = req.user.id;

        // Buscar el grupo por su ID
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        // Verificar que el usuario sea el administrador del grupo
        if (group.adminId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para ver los integrantes de este grupo' });
        }

        // Buscar todos los miembros activos del grupo, incluyendo sus datos de usuario
        const members = await GroupMember.findAll({
            where: { groupId, isActive: true },
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['id', 'firstName', 'lastName', 'email'] // Solo estos campos del usuario
            }]
        });

        // Formatear los resultados para una respuesta más limpia
        const result = members.map(member => ({
            userId: member.user.id,
            name: member.user.firstName + ' ' + member.user.lastName, // Nombre completo
            email: member.user.email,
            role: member.role,
            joinedAt: member.joinedAt
        }));

        // Devolver la lista de miembros formateada
        res.json(result);
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los integrantes del grupo' });
    }
}

/**
 * @function searchGroups
 * @description Controlador para realizar una búsqueda de grupos por nombre.
 * Permite filtrar los grupos existentes según un texto ingresado por el usuario.
 * La búsqueda es insensible a mayúsculas y minúsculas.
 * 
 * @async
 * @param {Object} req - Objeto de solicitud (Express).
 * @param {Object} req.query - Contiene los parámetros de consulta.
 * @param {string} req.query.query - Texto ingresado para realizar la búsqueda. Si no se proporciona, se asume cadena vacía.
 * @param {Object} res - Objeto de respuesta (Express).
 * 
 * @returns {JSON} 200 - Lista de hasta 10 grupos cuyo nombre coincida parcialmente con el texto buscado.
 * @returns {JSON} 500 - Si ocurre un error inesperado en el servidor.
 * 
 * @example
 * // Solicitud:
 * GET /api/groups/search?query=work
 * 
 * // Respuesta:
 * [
 *   { id: 1, name: "Work Group", ... },
 *   { id: 2, name: "Working Team", ... }
 * ]
 * 
 * @remarks
 * - Utiliza Sequelize y el operador `Op.iLike` para realizar una búsqueda que no distingue mayúsculas.
 * - Se limita a un máximo de 10 resultados ordenados alfabéticamente.
 */
async function searchGroups(req, res) {
    const query = req.query.query || '';
    const userId = req.user.id; // Debes tener auth middleware que setee req.user

    try {
        const groups = await Group.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${query}%` // Búsqueda insensible a mayúsculas
                }
            },
            include: [{
                model: User,
                where: { id: userId }, // Solo incluir grupos donde el usuario es miembro
            }],
            limit: 10, // máximo 10 resultados
            order: [['name', 'ASC']]
        });

        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar grupos' });
    }
}

// Exportar todas las funciones del controlador
module.exports = {
    createGroup,
    joinGroup,
    getUserGroups,
    inviteUser,
    acceptInvitation,
    getGroupById,
    getGroupMembers,
    searchGroups
};