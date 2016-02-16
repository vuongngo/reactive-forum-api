import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import Topic from '../../app/models/topic';

describe('Topic static methods', () => {
  beforeEach(done => {
    Topic.create({name: 'Mock'}, (err, res) => {
      done();
    })  
  });

  afterEach(done => {
    Topic.remove({}, (err, res) => {
      done();
    })
  });

  describe('createTopic', () => {
    it('should return topic', checkAsync( async (done) => {
      let topic = await Topic.createTopic('Test');
      expect(topic).to.have.property('_id');
      expect(topic.name).to.equal('Test');
    }));

    it('should return eror when topic is not unique', checkAsync(async (done) => {
      try {
        await Topic.createTopic('Mock');
      } catch (err) {
        expect(err).to.be.an('object');
        expect(err.errors.name.message).to.equal("Error, expected `name` to be unique. Value: `Mock`");
      }
    }));

    it('should return error when topic name is missing', checkAsync(async (done) => {
      try {
        await Topic.createTopic('');
      } catch(err) {
        expect(err).to.be.an('object');
        expect(err.errors.name.message).to.equal("Path `name` is required.");
      }
    }))

  })
})

