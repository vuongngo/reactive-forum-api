import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';
import User from '../../app/models/user';
import { genToken, verifyToken } from '../../app/utils/encryption';

describe('Topic API', () => {
  var server;
  var user;
  var token;
  
  before(() => {
    server = createServer();
  });

  beforeEach(checkAsync(async (done) => {
    user = await User.signupUser({username: 'Mock', password: '123456'});
    let res = await genToken(user);
    token = res;
    await User.where({_id: user._id}).update({$set: {token: token}});
  }));

  afterEach(checkAsync(async (done) => {
    await User.remove({});
  }));

  after(done => {
    server.close(done);
  });

  describe('signup endpoint', () => {
    
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

  });
  
  describe('signin endpoint', () => {
    
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

  });

  describe('signout endpoint', () => {
    it('should delete token from user', done => {
      request(server)
        .post('/api/signout')
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .expect(204, done)
    });

    it('should return unauthorized when token is wrong', done => {
      request(server)
        .post('/api/signout')
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ' + token + 1)
        .expect(401, done)
    })
  });
  
})
