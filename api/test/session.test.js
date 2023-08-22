import request from 'supertest';
import app from '../../app';


describe('Sessions API', () => {
  it('should log in a user', async () => {
    const userData = { email: '', password: '' };
    const response = await request(app)
      .post('/api/sessions/login')
      .send(userData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Login successful');
  });

  it('should log out a user', async () => {
    const response = await request(app).get('/api/sessions/logout');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Logout successful');
  });

  it('should get the current user session', async () => {
    const response = await request(app).get('/api/sessions/current');
    expect(response.status).to.equal(200);
    const { email, password } = response.body;
    expect(email).to.be.a('string');
    expect(password).to.be.a('string');
  });
});
