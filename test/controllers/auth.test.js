import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';
import User from '../../app/models/user';

describe('Topic API', () => {
  var server;
  var id;
  
  before(() => {
    server = createServer();
  });

  beforeEach(done => {
    User.signupUser({username: 'Mock', password: '123456'})
        .then(() => { done(); })
      .catch(err => {done();})
  });

  afterEach(done => {
    User.remove({}, (err, res) => {
      done();
    })
  });

  after(done => {
    server.close(done);
  });

  it('should return badRequest when username is missing', done => {
    request(server)
      .post('/api/signup')
      .send({username: '', password: '123456'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.error.text).to.contain('username is missing');
      })
      .expect(400, done)
  });

  it('should return serverErrror when username is already exist', done => {
    request(server)
      .post('/api/signup')
      .send({username: 'Mock', password: '123456'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.error.text).to.contain('to be unique');
      })
      .expect(500, done)
  });
  
  it('should create new user', done => {
    request(server)
      .post('/api/signup')
      .send({username: 'Test', password: '123456'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body.user.username).to.equal('Test');
        expect(res.body.token).to.contain('Bearer');
      })
      .expect(201, done)
  });

  it('should return error when user sign in with no username', done => {
    request(server)
      .post('/api/signin')
      .send({username: '', password: '123456'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.error.text).to.contain('is missing');
      })
      .expect(400, done)
  });

  it('should return error when user sign in with wrong password', done => {
    request(server)
      .post('/api/signin')
      .send({username: 'Mock', password: '1234567'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.error.text).to.contain('Wrong password');
      })
      .expect(401, done)
  });
  
  it('should signin user', done => {
    request(server)
      .post('/api/signin')
      .send({username: 'Mock', password: '123456'})
      .set('Accept', 'application/json')
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body.user.username).to.equal('Mock');
        expect(res.body.token).to.contain('Bearer');
      })
      .expect(200, done)
  });
    
})
