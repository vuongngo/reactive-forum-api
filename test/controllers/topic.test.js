import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';
import Topic from '../../app/models/topic';
import { genToken, verifyToken } from '../../app/utils/encryption';
import User from '../../app/models/user';

describe('Topic API', () => {
  var server;
  var id;
  var token;
  var user;
  
  before(() => {
    server = createServer();
  });

  beforeEach(done => {
    Topic.create({name: 'Mock'}, (err, res) => {
      id = res._id;
      User.create({username: 'Mock', password: '123456', salt: '123', hash: '123', userrole: 'admin'})
          .then(res => {
            user = res;
            genToken(user)
            .then(res => {
              token = res;
              User.where({_id: user._id}).update({$set: {token: token}}, (err, res) => {
                done();
              })
            })
            .catch(err => { done(); })
          })
          .catch(err => { done(); })
    })
  });

  afterEach(done => {
    Topic.remove({}, (err, res) => {
      User.remove({}, () => {
        done();
      })
    })
  });

  after(done => {
    server.close(done);
  });
  
  it('should get api', done => {
    request(server)
      .get('/api')
      .expect(200, done)
  });

  describe('get topic endpoint', () => {

    it('should not return topic with wrong id', done => {
      request(server)
      .get(`/api/topic/1`)
      .expect(res => {
        expect(res.error.text).to.contain('Cast to');
      })
      .expect(404, done);
    });

    it('should return topic', done => {
      request(server)
      .get(`/api/topic/${id}`)
      .expect(res => {
        expect(res.body.topic.name).to.equal('Mock');
      })
      .expect(200, done);
    });
    
  });

  describe('post topic endpoint', () => {

    it('should return unauthorized when user is not admin', done => {
      User.update({_id: user._id}, {$unset: {userrole: 1}}, (err, res) => {
        request(server)
          .post('/api/topic')
          .set('authorization', 'Bearer ' + token)
          .expect(401, done)
      })
    });

    it('should return badRequest when Topic name is not pass', done => {
      request(server)
    .post('/api/topic')
    .set('authorization', 'Bearer ' + token)
    .expect(res => {
      expect(res.error.text).to.contain('Topic name is missing');
    })
    .expect(400, done)
    });

    it('should get new Topic', done => {
      request(server)
    .post('/api/topic')
    .send({name: 'Test'})
    .set('Accept', 'application/json')
    .set('authorization', 'Bearer ' + token)
    .expect(res => {
      expect(res.body).to.be.an('object');
      expect(res.body.topic.name).to.equal('Test');
    })
    .expect(201, done)
    });

    it('should return badRequest when Topic name is repreated', done => {
      request(server)
    .post('/api/topic')
    .send({name: 'Mock'})
    .set('Accept', 'application/json')
    .set('authorization', 'Bearer ' + token)
    .expect(res => {
      expect(res).to.be.an('object');
      expect(res.error.text).to.contain('expected `name` to be unique');
    })
    .expect(500, done)
    });
    
  });

  describe('put topic endpoint', () => {

    it('should return status of 401 when not authenticate', done => {
      request(server)
      .put(`/api/topic/${id}`)
      .set('Accept', 'application/json')
      .send({name: 'UpdatedMock'})
      .expect(401, done)
    });

    it('should return status of 204 when Topic name is updated', done => {
      request(server)
      .put(`/api/topic/${id}`)
      .set('Accept', 'application/json')
      .set('authorization', 'Bearer ' + token)
      .send({name: 'UpdatedMock'})
      .expect(204, done)
    });

    it('should return badRequest when Topic name is missing', done => {
      request(server)
      .put(`/api/topic/${id}`)
      .set('Accept', 'application/json')
      .set('authorization', 'Bearer ' + token)
      .send({name: ''})
      .expect(res => {
        expect(res.error.text).to.contain('Topic name is missing');
      })
      .expect(400, done)
    });

    it('should return server error  when Topic not found', done => {
      request(server)
      .put(`/api/topic/1`)
      .set('Accept', 'application/json')
      .set('authorization', 'Bearer ' + token)
      .send({name: 'yo', path: 'ye'})
      .expect(res => {
        expect(res.error.text).to.contain('Cast to');
      })
      .expect(404, done)
    });
    
  });

  describe('delete topic endpoint', () => {

    it('should return status of 401 when user not authenticate', done => {
      request(server)
      .del(`/api/topic/${id}`)
      .expect(401, done);
    });

    it('should return status of 202 when Topic is removed', done => {
      request(server)
      .del(`/api/topic/${id}`)
      .set('authorization', 'Bearer ' + token)
      .expect(202, done);
    });

    it('should return status of 500 when topic not found', done => {
      request(server)
      .del(`/api/topic/1`)
      .set('authorization', 'Bearer ' + token)
      .expect(res => {
        expect(res.error.text).to.contain('Cast to');
      })
      .expect(404, done);
    });
  });

  describe('get topics endpoint', () => {

    it('should return list of Topics', done => {
      request(server)
      .get('/api/topics')
      .expect(res => {
        expect(res.body.topics.length).to.equal(1);
      })
      .expect(200, done)
    });

    it('should return list om empty Topics', done => {
      request(server)
      .get('/api/topics')
      .query({last: new Date(2016, 1, 1)})
      .expect(res => {
        expect(res.body.topics.length).to.equal(0);
      })
      .expect(200, done)
    })
    
  })
    
})
