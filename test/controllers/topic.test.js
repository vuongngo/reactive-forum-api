import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';
import Topic from '../../app/models/topic';

describe('Topic API', () => {
  var server;
  var id;
  
  before(() => {
    server = createServer();
  });

  beforeEach(done => {
    Topic.create({name: 'Mock'}, (err, res) => {
      id = res._id;
      done();
    })  
  });

  afterEach(done => {
    Topic.remove({}, (err, res) => {
      done();
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

  it('should return topic', done => {
    request(server)
      .get(`/api/topic/${id}`)
      .expect(res => {
        expect(res.body.topic.name).to.equal('Mock');
      })
      .expect(200, done);
  });

  it('should return badRequest when Topic name is not pass', done => {
    request(server)
      .post('/api/topic')
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
      .expect(res => {
        expect(res).to.be.an('object');
        expect(res.error.text).to.contain('expected `name` to be unique');
      })
      .expect(500, done)
  });

  it('should return status of 204 when Topic name is updated', done => {
    request(server)
      .put(`/api/topic/${id}`)
      .set('Accept', 'application/json')
      .send({name: 'UpdatedMock'})
      .expect(204, done)
  });

  it('should return badRequest when Topic name is missing', done => {
    request(server)
      .put(`/api/topic/${id}`)
      .set('Accept', 'application/json')
      .send({name: ''})
      .expect(res => {
        expect(res.error.text).to.contain('Topic name is missing');
      })
      .expect(400, done)
  });

  it('should return server error  when Topic can not be updated', done => {
    request(server)
      .put(`/api/topic/1`)
      .set('Accept', 'application/json')
      .send({name: 'yo', path: 'ye'})
      .expect(res => {
        expect(res.error.text).to.contain('Cast to');
      })
      .expect(500, done)
  });

  it('should return status of 202 when Topic is removed', done => {
    request(server)
      .del(`/api/topic/${id}`)
      .expect(202, done);
  });

  it('should return status of 500 when topic can not be removed', done => {
    request(server)
      .del(`/api/topic/1`)
      .expect(res => {
        expect(res.error.text).to.contain('Cast to');
      })
      .expect(500, done);
  });

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
