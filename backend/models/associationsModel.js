// Modelo para asociar los Modelos/Tablas

const { User } = require('./userModel');
const Group = require('./groupModel');
const GroupMember = require('./groupMemberModel');
const Task = require('./taskModel');
const TaskComment = require('./taskCommentModel');
const Invitation = require('./invitationModel');
const Notification = require('./notificationModel'); // No olvides importarlo


// Establecer asociaciones

// User - Group (Administrador)
User.hasMany(Group, {
  foreignKey: 'adminId',
  as: 'administeredGroups'
});
Group.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});

// User - GroupMember (Muchos a muchos a través de GroupMember)
User.hasMany(GroupMember, {
  foreignKey: 'userId',
  as: 'groupMemberships'
});
GroupMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Group.hasMany(GroupMember, {
  foreignKey: 'groupId',
  as: 'memberships'
});
GroupMember.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group'
});

// Asociación muchos a muchos User-Group
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId',
  otherKey: 'groupId',
  as: 'memberGroups'
});
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId',
  otherKey: 'userId',
  as: 'members'
});

// Task asociaciones
Group.hasMany(Task, {
  foreignKey: 'groupId',
  as: 'tasks'
});
Task.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group'
});

User.hasMany(Task, {
  foreignKey: 'assignedBy',
  as: 'assignedTasks'
});
Task.belongsTo(User, {
  foreignKey: 'assignedBy',
  as: 'assigner'
});

User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'receivedTasks'
});
Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee'
});

// TaskComment asociaciones
Task.hasMany(TaskComment, {
  foreignKey: 'taskId',
  as: 'comments'
});
TaskComment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

User.hasMany(TaskComment, {
  foreignKey: 'userId',
  as: 'comments'
});
TaskComment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Invitation asociaciones
Group.hasMany(Invitation, {
  foreignKey: 'groupId',
  as: 'invitations'
});
Invitation.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group'
});

User.hasMany(Invitation, {
  foreignKey: 'invitedBy',
  as: 'sentInvitations'
});
Invitation.belongsTo(User, {
  foreignKey: 'invitedBy',
  as: 'inviter'
});


// Un usuario tiene muchas notificaciones
User.hasMany(Notification, {
  foreignKey: 'userId', // ¡usa snake_case real de tu tabla!
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Una tarea puede tener muchas notificaciones
Task.hasMany(Notification, {
  foreignKey: 'taskId',
  as: 'notifications'
});
Notification.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

module.exports = {
  User,
  Group,
  GroupMember,
  Task,
  TaskComment,
  Invitation
};