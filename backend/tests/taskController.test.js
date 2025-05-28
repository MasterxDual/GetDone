const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const taskRoutes = require('../routes/taskRoutes');
const { sequelize, Task, User, Group } = require('../models/associationsModel');

const app = express();
app.use(bodyParser.json());
app.use('/api/tasks', taskRoutes);

// Mock authentication middleware to set req.user
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Create test user and group
  await User.create({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'hashedpassword' });
  await Group.create({ id: 1, name: 'Test Group', description: 'Group for testing', adminId: 1, inviteCode: 'abcd1234' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Task Controller Endpoints', () => {
  test('Create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        description: 'Task description',
        due_date: '2025-12-31',
        priority: 'Alta',
        groupId: 1,
        assignedTo: 1,
        status: 'pendiente'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.tarea).toHaveProperty('id');
    expect(res.body.tarea.title).toBe('Test Task');
  });

  test('Get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Get task by ID', async () => {
    const tasks = await Task.findAll();
    const taskId = tasks[0].id;

    const res = await request(app)
      .get(`/api/tasks/${taskId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', taskId);
  });
});
