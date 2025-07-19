const cron = require('node-cron');
const  Task = require('../models/taskModel');
const { User } = require('../models/userModel');
const { sendExpiringTask } = require('../controllers/emailController'); // importa tu configuración de mailer
const { Op } = require('sequelize');
const Notification = require('../models/notificationModel'); // Importa el modelo de notificaciones

/**
 * Tarea programada con cron que se ejecuta cada minuto.
 * Busca tareas cuya fecha de vencimiento sea entre hoy y mañana y envía un correo electrónico
 * de notificación al usuario asignado si tiene correo electrónico registrado.
*
* @function
* @async
* @name scheduledTaskNotification
*
* @requires module:node-cron
* @requires module:../models/taskModel
* @requires module:../models/userModel
* @requires module:../controllers/emailController (sendExpiringTask)
*
* @returns {void}
*
* @example
* // Ejecuta esta función automáticamente cada minuto:
* cron.schedule('* * * * *', scheduledTaskNotification);
*/
// Corre cada hora : 0 * * * *
// Corre cada minuto : * * * * *
cron.schedule('* * * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // inicio del día

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // fin del día siguiente

    // Busca tareas que vencen entre hoy y mañana inclusive
    const tasks = await Task.findAll({
      where: {
        delivery_date: {
          [Op.between]: [today, tomorrow]
        },
        expiring_notification_sent: false // Busca tareas que a las que no se les ha enviado una notificación previamente
      }
    });

    for (const task of tasks) {
      const user = await User.findByPk(task.assignedTo);

      // Verifica si el usuario tiene un email registrado
      if (user && user.email) {
        await sendExpiringTask(user.email, task); // Envía el correo de notificación de vencimiento

        // Marca la tarea como notificada para evitar enviar múltiples correos
        task.expiring_notification_sent = true;

        // Crea una notificación en la base de datos si la tarea está por vencer
        await Notification.create({
          userId: user.id,
          type: 'expiring',
          taskId: task.id,
          message: `Tarea "${task.title}" está por vencer.<br>Fecha de vencimiento: ${task.delivery_date}.`,
          isRead: false
        });
        
        await task.save();
      }
    }

    console.log('Notificaciones de tareas próximas enviadas');
  } catch (err) {
    console.error('Error enviando notificaciones:', err);
  }
});