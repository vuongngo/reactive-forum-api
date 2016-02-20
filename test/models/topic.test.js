import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import Topic from '../../app/models/topic';

describe('Topic static methods', () => {
  beforeEach(checkAsync(async (done) => {
    await Topic.create({name: 'Mock'});
  }));

  afterEach(checkAsync(async (done) => {
    Topic.remove({});
  }))

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
        expect(err.name).to.equal('ValidationError');
        expect(err.errors.name.message).to.equal("Error, expected `name` to be unique. Value: `Mock`");
      }
    }));

    it('should return error when topic name is missing', checkAsync(async (done) => {
      try {
        await Topic.createTopic('');
      } catch(err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.errors.name.message).to.equal("Path `name` is required.");
      }
    }));
   
  });

  describe('createTopics', () => {
    it('should return topic', checkAsync( async (done) => {
      let topics = await Topic.createTopics(['Test1', 'Test2']);
      expect(topics.length).to.equal(2);
    }));

    it('should return validation error', checkAsync(async (done) => {
      try {
        await Topic.createTopics(['Test1', '']);
      } catch(err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.errors.name.message).to.equal("Path `name` is required.");
      }
    }));
  });
  
})

