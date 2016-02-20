import request from 'supertest';
import expect from 'expect.js';
import createServer from '../test_server';
import { checkAsync } from '../utils/check';
import { genToken, verifyToken } from '../../app/utils/encryption';
import User from '../../app/models/user';
import Thread from '../../app/models/thread';
import Topic from '../../app/models/topic';

describe('Thread API', () => {
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
    server = createServer();
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
    await Topic.remove({});
    await User.remove({});
  }));

  after(done => {
    server.close(done);
  });

  describe('get threads endpoint', () => {
    it('should get array of one thread', done => {
      request(server)
        .get('/api/threads')
        .expect(res => {
          expect(res.body.threads.length).to.equal(1);
        })
        .expect(200, done);
    });

    it('should get error when query is wrong', done => {
      request(server)
        .get('/api/threads?createdAt=lt:date')
        .expect(res => {
          expect(res.error.text).to.contain('Cast to');
        })
        .expect(404, done);
    });

    it('should get empty array of thread', done => {
      let date = new Date('2015, 12, 12');
      request(server)
        .get('/api/threads?createdAt=lt:' + date)
        .expect(res => {
          expect(res.body.threads.length).to.equal(0);
        })
        .expect(200, done);
    })
  });

  describe('get thread endpoint', () => {
    it('should return error when thread is not found', done => {
      request(server)
        .get('/api/thread/1')
        .expect(res => {
          expect(res.error.text).to.contain('Cast to');
        })
        .expect(404, done);
    });

    it('should return thread', done => {
      request(server)
        .get('/api/thread/' + thread._id)
        .expect(res => {
          expect(res.body.thread._id.toString()).to.equal(thread._id.toString());
        })
        .expect(200, done);
    });
  });

  describe('create thread endpoint', () => {
    let params = {title: 'Test', body: 'Test'};
    it('should return unauthenticate error', done => {
      request(server)
        .post('/api/thread')
        .send(params)
        .expect(res => {
          expect(res.error.text).to.contain('Unauthorized');
        })
        .expect(401, done);
    });

    it('should return error when param is missing', done => {
      params._topic = '';
      request(server)
        .post('/api/thread')
        .set('authorization', 'Bearer ' + userToken)
        .send(params)
        .expect(res => {
          expect(res.error.text).to.contain('is missing');
        })
        .expect(400, done);
    });

    it('should return thread', done => {
      params._topic = topic._id;
      request(server)
        .post('/api/thread')
        .set('authorization', 'Bearer ' + userToken)
        .send(params)
        .expect(res => {
          expect(res.body.thread.title).to.equal('Test');
          expect(res.body.thread._user.username).to.equal('Mock');
        })
        .expect(201, done);
    });
      
  });
})
