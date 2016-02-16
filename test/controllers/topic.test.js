import request from 'supertest';
import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import createServer from '../test_server';

describe('Topic API', () => {
  var server;

  beforeEach(() => {
    server = createServer();
  });

  afterEach(done => {
    server.close(done);
  })
  
  it('should get api', done => {
    request(server)
      .get('/api')
      .expect(200, done)
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
        expect(res).to.be.an('object');
      })
      .expect(201, done)
  });
})
