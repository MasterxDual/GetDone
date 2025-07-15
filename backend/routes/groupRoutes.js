// Rutas para la gestión de grupos

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/authMiddleware');

// /* TODO: No es problema en desarollo pero en produccion usar autenticacion real */
// // Middleware para simular autenticación y obtener usuario (debe reemplazarse con autenticación real)
// function mockAuth(req, res, next) {
//     // Simular usuario autenticado con id 1 para pruebas
//     req.user = { id: 1 };
//     next();
// }

// Para evitar lo anterior mencionado , se utiliza un middleware de autenticación real
router.use(authenticateToken); // Aplica autenticación JWT a todas las rutas de grupos

// router.use(mockAuth);

/**
 * Crear un nuevo grupo
 * POST /api/groups
 */
router.post('/', groupController.createGroup);

/**
 * Unirse a un grupo mediante código de invitación
 * POST /api/groups/join
 */
router.post('/join', groupController.joinGroup);

/**
 * Obtener los grupos a los que pertenece el usuario
 * GET /api/groups
 */
router.get('/', groupController.getUserGroups);

/**
 * Enviar invitación para unirse a un grupo
 * POST /api/groups/invite
 */
router.post('/invite', groupController.inviteUser);

/**
 * Aceptar una invitación mediante token
 * POST /api/groups/accept
 */
router.post('/accept', groupController.acceptInvitation);

/**
 * Obtener los detalles de un grupo por su ID
 * GET /api/groups/:id
 */
router.get('/:id', groupController.getGroupById);

/**
 * Obtener los integrantes de un grupo (solo admin)
 * GET /api/groups/:id/members
 */
router.get('/:id/members', groupController.getGroupMembers);

/**
 * Buscar grupos por nombre o descripción
 * GET /api/groups/search?query=texto
 * @api {GET} /api/groups/search || /api/groups/search?query=texto
 * @apiName SearchGroups
 * @apiGroup Groups
 * @apiParam {String} query Texto a buscar en nombre o descripción de grupos
 * @apiSuccess {Array} groups Lista de grupos que coinciden con la búsqueda
 */
router.get('/search', groupController.searchGroups);

module.exports = router;
