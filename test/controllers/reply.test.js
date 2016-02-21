import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import { genToken, verifyToken } from '../../app/utils/encryption';
import User from '../../app/models/user';
import Thread from '../../app/models/thread';
import Topic from '../../app/models/topic';

describe('Reply API', () => {
  var server;
  var topic;
  var thread;
  var user;
  var userToken;
  var anotherUser;
  var anotherUserToken;
  var admin;
  var adminToken;
  before(() => {
    delete require.cache[require.resolve('../../server')];
    server = require('../../server');
  });

  beforeEach(checkAsync(async (done) => {
    topic = await Topic.create({name: 'Mock'});
    //Mock user
    user = await User.signupUser({username: 'Mock', password: '123456'});
    userToken = await genToken(user);
    await User.where({_id: user._id}).update({$set: {token: userToken}});
    //Mock admin
    admin = await User.create({username: 'MockAdmin', password: '123456', salt: '123', hash: '123', userrole: 'admin'});
    adminToken = await genToken(admin);
    await User.where({_id: admin._id}).update({$set: {token: adminToken}});
    //Mock anotherUser
    anotherUser = await User.signupUser({username: 'MockAnother', password: '123456'});
    anotherUserToken = await genToken(anotherUser);
    await User.where({_id: anotherUser._id}).update({$set: {token: anotherUserToken}});
    //Mock thread
    let th = await Thread.create({_topic: topic._id, _user: user._id, title: 'Mock', body: 'Mock'});
    let res = await Thread.createComment(user._id, th._id, 'Mock');
    thread = await Thread.createReply(user._id, th._id, res.comments[0]._id, 'Mock');
  }));

  afterEach(checkAsync( async (done) => {
    await Thread.remove({});
    await Topic.remove({});
    await User.remove({});
  }));

  after(done => {
    server.close(done);
  });

  describe('create reply endpoint', () => {
    it('should return unauthenticate error', done => {
      request(server)
        .post(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply`)
        .send({text: 'Test'})
        .expect(401, done);
    });

    it('should return thread with two replies', done => {
      request(server)
        .post(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply`)
        .set('authorization', 'Bearer ' + userToken)
        .send({text: 'Test'})
        .expect(res => {
          expect(res.body.thread.comments[0].replies.length).to.equal(2);
        })
        .expect(200, done);
    });
  });

  describe('update reply endpoint', () => {
    it('should return unauthenticate error', done => {
      request(server)
        .put(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .send({text: 'Test'})
        .expect(401, done);
    });

    it('should return unauthorized error when user did not create reply', done => {
      request(server)
        .put(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + anotherUserToken)
        .send({text: 'Update Test'})
        .expect(401, done);
    });
    
    it('should return thread with updated reply as user', done => {
      request(server)
        .put(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + userToken)
        .send({text: 'Updated Test'})
        .expect(res => {
          expect(res.body.thread.comments[0].replies[0].text).to.equal('Updated Test');
        })
        .expect(200, done);
    });

    it('should return thread with updated reply as admin', done => {
      request(server)
        .put(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + adminToken)
        .send({text: 'Updated Test'})
        .expect(res => {
          expect(res.body.thread.comments[0].replies[0].text).to.equal('Updated Test');
        })
        .expect(200, done);
    });
  });
  
  describe('remove reply endpoint', () => {
    it('should return unauthenticate error', done => {
      request(server)
        .del(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .send({text: 'Test'})
        .expect(401, done);
    });

    it('should return unauthorized error when user did not create reply', done => {
      request(server)
        .del(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + anotherUserToken)
        .send({text: 'Remove Test'})
        .expect(401, done);
    });
    
    it('should removed reply as user', done => {
      request(server)
        .del(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + userToken)
        .send({text: 'Removed Test'})
        .expect(200, done);
    });

    it('should removed reply as admin', done => {
      request(server)
        .del(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}`)
        .set('authorization', 'Bearer ' + adminToken)
        .send({text: 'Removed Test'})
        .expect(200, done);
    });
  });

  describe('like reply endpoint', () => {
    it('should return unauthenticate error', done => {
      request(server)
        .get(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}/like`)
        .expect(401, done);
    });

    it('should liked reply as user', done => {
      request(server)
        .get(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}/like`)
        .set('authorization', 'Bearer ' + userToken)
        .expect(res => {
          expect(res.body.thread.comments[0].replies[0].likes).to.equal(1);
          expect(res.body.thread.comments[0].replies[0].likeIds.toString()).to.contain(user._id);
        })
        .expect(200, done);
    });

    it('should unlike comment as user', done => {
      Thread.likeReply(user._id, thread._id, thread.comments[0]._id, thread.comments[0].replies[0]._id)
            .then(res => {
              request(server)
                .get(`/api/thread/${thread._id}/comment/${thread.comments[0]._id}/reply/${thread.comments[0].replies[0]._id}/like`)
                .set('authorization', 'Bearer ' + userToken)
                .expect(res => {
                  expect(res.body.thread.comments[0].replies[0].likes).to.equal(0);
                  expect(res.body.thread.comments[0].replies[0].likeIds.toString()).not.to.contain(user._id);
                })
                .expect(200, done);
            })
            .catch(err => done());
    });
  });
})

