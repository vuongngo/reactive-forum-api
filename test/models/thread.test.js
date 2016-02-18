import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import User from '../../app/models/user';
import Thread from '../../app/models/thread';
import Topic from '../../app/models/topic';

describe('Thread static methods', () => {
  var userId;
  var threadId;
  var topicId;
  beforeEach(done => {
    User.signupUser({username: 'Mock', password: '123456'})
        .then(res => {
          userId = res._id;
          Topic.create({name: 'Mock'}, (err, topic) => {
            topicId = topic._id;
            Thread.create({_topic: topic._id, _user: userId, title: 'Mock', body: 'Mock'}, (err, res) => {
              threadId = res._id;
              done();
            })
          })          
        })
        .catch(err => {console.log(err); done(); });
  });
  
  afterEach(done => {
    User.remove({}, (err, res) => {
      Topic.remove({}, (err, res) => {
        Thread.remove({}, (err, res) => {
          done();
        })
      })
    })
  });

  describe('createThread', () => {
    it('should return error when _topic is missing', checkAsync( async (done) => {
      try {
        let thread = await Thread.createThread({});
      } catch (err) {
        expect(err.message).to.contain('Thread validation failed');
      }
    }));

    it('should return thread with right params', checkAsync( async (done) => {
      try {
        let thread = await Thread.createThread({_topic: topicId, _user: userId, title: 'Test', body: 'Test' });
        expect(thread.title).to.equal('Test');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }))

  });

  describe('updateThread', () => {
    it('should return error when using wrong threadId', checkAsync(async (done) => {
      try {
        let thread = await Thread.updateThread('123', {});
      } catch(err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return previous thread when params is invalid', checkAsync(async (done) => {
      try {
        await Thread.updateThread(threadId, {title: ''});
        let thread = await Thread.findOne({_id: threadId}).exec();
        expect(thread.title).to.equal('Mock');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should mutate type', checkAsync(async (done) => {
      try {
        await Thread.updateThread(threadId, {tags: 'Test'});
        let thread = await Thread.findOne({_id: threadId}).exec();
        expect(thread.tags).to.contain('Test');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('likeThread', () => {
    it('should increase like', checkAsync(async (done) => {
      try {
        await Thread.likeThread(userId, threadId);
        let thread = await Thread.findOne({_id: threadId}).exec();
        expect(thread.likes).to.equal(1);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should decrease like', checkAsync(async (done) => {
      try {
        await Thread.likeThread(userId, threadId);
        await Thread.likeThread(userId, threadId);
        let thread = await Thread.findOne({_id: threadId}).exec();
        expect(thread.likes).to.equal(0);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));
  });

})
