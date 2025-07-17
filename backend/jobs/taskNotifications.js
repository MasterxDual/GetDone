const cron = require('node-cron');
const  Task = require('../models/taskModel');
const { User } = require('../models/userModel');
const { sendExpiringTask } = require('../controllers/emailController'); // importa tu configuración de mailer

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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Busca tareas que vencen mañana (ajusta según tu modelo y formato de fecha)
    const tasks = await Task.findAll({ where: { delivery_date: tomorrow } });

    for (const task of tasks) {
      const user = await User.findByPk(task.assignedTo);
      
      if (user && user.email) {
        sendExpiringTask(user.email, task)
      }
    }
    console.log('Notificaciones de tareas próximas enviadas');
  } catch (err) {
    console.error('Error enviando notificaciones:', err);
  }
});