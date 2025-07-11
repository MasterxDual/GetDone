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

// Controlador para enviar el código de verificación para restablecer la contraseña
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