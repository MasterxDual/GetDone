// Controlador para enviar correos electrónicos de verificación

// Importar dependencias
const nodemailer = require('nodemailer');

// Controlador para enviar el código de verificación por correo electrónico
exports.sendVerificationCode = async (req, res) => {
    // Validar que se reciban los datos necesarios
    const { email, code } = req.body;
    // Si faltan datos, devolver un error 400
    if (!email || !code) return res.status(400).json({ error: 'Faltan datos' });

    // Configurar el transporte de nodemailer para enviar correos electrónicos
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Configurar las opciones del correo electrónico
    const mailOptions = {
        from: `"GetDone" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Tu código de verificación para GetDone',
        html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>¡Bienvenido a GetDone!</h2>
                <p>Hola,</p>
                <p>Para continuar con tu registro, utiliza el siguiente código de verificación:</p>
                <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.2rem; margin: 16px 0; color: #1976d2;">
                    ${code}
                </div>
                <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
                <hr>
                <small>GetDone – Plataforma de gestión de tareas</small>
            </div>
        `
    };

    // Enviar el correo electrónico
    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Código enviado' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo enviar el correo' });
    }
};

/**
 * Controlador para enviar el código de verificación para restablecer la contraseña.
 *
 * Esta función se encarga de enviar un correo electrónico con un código de verificación
 * al usuario que desea restablecer su contraseña. Utiliza Nodemailer con configuración SMTP
 * (servicio Gmail en este caso) para realizar el envío.
 *
 * @async
 * @function
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Contiene el email del usuario y el código de verificación.
 * @param {string} req.body.email - Dirección de correo electrónico del destinatario.
 * @param {string} req.body.code - Código de verificación generado para restablecer contraseña.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} - Devuelve una respuesta JSON con éxito o mensaje de error.
 *
 * @throws {400} Si faltan datos obligatorios (`email` o `code`).
 * @throws {500} Si ocurre un error al enviar el correo electrónico.
 *
 * @example
 * POST /api/auth/send-reset-code
 * Body:
 * {
 *   "email": "usuario@example.com",
 *   "code": "123456"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "message": "Código de restablecimiento enviado"
 * }
 */
exports.sendResetPasswordCode = async (req, res) => {
    // Validar que se reciban los datos necesarios
    const { email, code } = req.body;

    // Si faltan datos, devolver un error 400
    if (!email || !code) return res.status(400).json({ error: 'Faltan datos' });

    // Configurar el transporte de nodemailer para enviar correos electrónicos
    const transporter = nodemailer.createTransport({ service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        } });

    // Configurar las opciones del correo electrónico
    const mailOptions = {
        from: `"GetDone" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablece tu contraseña en GetDone',
        html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>Restablece tu contraseña</h2>
                <p>Utiliza el siguiente código para restablecer tu contraseña:</p>
                <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.2rem; margin: 16px 0; color: #1976d2;">
                    ${code}
                </div>
                <p>Si no solicitaste este código, ignora este mensaje.</p>
            </div>
        `
    };

    // Enviar el correo electrónico
    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Código de restablecimiento enviado' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo enviar el correo' });
    }
};