const cron = require('node-cron');
const  Task = require('../models/taskModel');
const { User } = require('../models/userModel');
const { sendExpiringTask } = require('../controllers/emailController'); // importa tu configuración de mailer
const { Op } = require('sequelize');

/**
 * Tarea programada con cron que se ejecuta cada minuto.
 * Busca tareas cuya fecha de vencimiento sea mañana y envía un correo electrónico
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
        }
      }
    });

    for (const task of tasks) {
      const user = await User.findByPk(task.assignedTo);
      if (user && user.email) {
        await sendExpiringTask(user.email, task);
      }
    }

    console.log('Notificaciones de tareas próximas enviadas');
  } catch (err) {
    console.error('Error enviando notificaciones:', err);
  }
});