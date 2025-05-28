const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const groupRoutes = require('../routes/groupRoutes');
const { sequelize, Group, GroupMember, Invitation, User } = require('../models/associationsModel');

const app = express();
app.use(bodyParser.json());
app.use('/api/groups', groupRoutes);

// Mock authentication middleware to set req.user
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Create a test user
  await User.create({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'hashedpassword' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Group Controller Endpoints', () => {
  let inviteCode;
  let invitationToken;

  test('Create a new group', async () => {
    const res = await request(app)
      .post('/api/groups')
      .send({ name: 'Test Group', description: 'A group for testing' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.group).toHaveProperty('id');
    expect(res.body.group.name).toBe('Test Group');
    inviteCode = res.body.group.inviteCode;
  });

  test('Join group with invite code', async () => {
    const res = await request(app)
      .post('/api/groups/join')
      .send({ inviteCode });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Te has unido al grupo exitosamente');
  });

  test('Get user groups', async () => {
    const res = await request(app)
      .get('/api/groups');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Invite user to group', async () => {
    // Get group id
    const groups = await Group.findAll();
    const groupId = groups[0].id;

    const res = await request(app)
      .post('/api/groups/invite')
      .send({ groupId, email: 'invitee@example.com' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.invitation).toHaveProperty('token');
    invitationToken = res.body.invitation.token;
  });

  test('Accept invitation', async () => {
    // Create invitee user
    await User.create({ id: 2, email: 'invitee@example.com', firstName: 'Invitee', lastName: 'User', password: 'hashedpassword' });

    // Mock auth for invitee user
    app.use((req, res, next) => {
      req.user = { id: 2 };
      next();
    });

    const res = await request(app)
      .post('/api/groups/accept')
      .send({ token: invitationToken });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Invitación aceptada, ahora eres miembro del grupo');
  });
});
