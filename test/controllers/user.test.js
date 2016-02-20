import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';
import User from '../../app/models/user';
import { genToken, verifyToken } from '../../app/utils/encryption';

describe('User API', () => {
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

  describe('get users endpoint', () => {
    
    it('should return users', done => {
      request(server)
       .get('/api/users')
       .expect(res => {
         expect(res.body.users.length).to.equal(1);
       })
       .expect(200, done)
    });

    it('should return no users', done => {
      let date = new Date('2015, 10, 10');
      request(server)
        .get(`/api/users?createdAt=lt:${date}`)
        .expect(res => {
          expect(res.body.users.length).to.equal(0);
        })
        .expect(200, done);
    });

  });

  describe('get user endpoint', () => {

    it('should return 404 if user not exist', done => {
      request(server)
        .get('/api/user/1')
        .expect(404, done);
    });

    it('should return user', done => {
      request(server)
        .get('/api/user/' + user._id)
        .expect(res => {
          expect(res.body.user._id.toString()).to.equal(user._id.toString());
        })
        .expect(200, done);
    });
      
  });

  describe('update user endpoint', () => {

    it('should return unauthenticate if user not sign in', done => {
      request(server)
        .put('/api/user/' + user._id)
        .send({username: 'yo'})
        .expect(401, done);
    });

    it('should return 204 if user exist', done => {
      request(server)
        .put('/api/user/' + user._id)
        .send({username: 'yo'})
        .set('authorization', 'Bearer ' + token)
        .expect(204, done);
    });
  });

  describe('remove user endpoint', () => {

    it('should return unauthorized if user not sign in', done => {
      request(server)
        .del('/api/user/' + user._id)
        .expect(401, done);
    });

    it('should return successfully remove when user is owner', done => {
      request(server)
        .del('/api/user/' + user._id)
        .set('authorization', 'Bearer ' + token)
        .expect(202, done);
    });
  });
});
