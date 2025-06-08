// Importación del módulo JWT para trabajar con tokens JSON Web
const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticación mediante JWT
 * Verifica la validez del token proporcionado en el header Authorization
 * y adjunta los datos decodificados al objeto request para su uso en rutas protegidas
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void|Object} - Continúa al siguiente middleware o devuelve respuesta de error
 */
function authenticateToken(req, res, next) {
    // Obtener el header de autorización de la solicitud
    const authHeader = req.headers['authorization'];
    
    // Verificar si el header de autorización existe
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Token no proporcionado' 
        });
    }

    // Extraer el token del header (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    
    // Verificar si el token existe después de separar el header
    if (!token) {
        return res.status(401).json({ 
            message: 'Token no proporcionado' 
        });
    }

    try {
        // Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar los datos del usuario decodificados al objeto request
        req.user = decoded;
        
        // Continuar con el siguiente middleware o controlador
        next();
    } catch (err) {
        // Manejar errores de token inválido/expirado
        return res.status(403).json({ 
            message: 'Token inválido' 
        });
    }
}

// Exportar la función middleware para su uso en otras partes de la aplicación
module.exports = authenticateToken;