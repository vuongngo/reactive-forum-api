import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import User from '../../app/models/user';
import Thread from '../../app/models/thread';
import Topic from '../../app/models/topic';

describe('Thread static methods', () => {
  var userId;
  var threadId;
  var topicId;
  beforeEach(checkAsync(async (done) => {
    let user = await User.signupUser({username: 'Mock', password: '123456'});
    userId = user._id;
    let topic = await Topic.create({name: 'Mock'});
    topicId = topic._id;
    let thread = await Thread.create({_topic: topic._id, _user: userId, title: 'Mock', body: 'Mock'});
    threadId = thread._id;
  }));

  afterEach(checkAsync(async (done) => {
    await User.remove({});
    await Topic.remove({});
    await Thread.remove({});
  }));
  
  describe('getThreadById', () => {
    beforeEach(checkAsync( async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return error when threadId is invalid', checkAsync(async (done) => {
      try {
        await Thread.getThreadById('123');
      } catch(err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return thread with populated user', checkAsync(async (done) => {
      try {
        let thread = await Thread.getThreadById(threadId);
        expect(thread._id.toString()).to.equal(threadId.toString());
        expect(thread._user.username).to.equal('Mock');
        expect(thread.comments[0]._user.username).to.equal('Mock');
        expect(thread.comments[0].replies[0]._user.username).to.equal('Mock');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }))
  });

  describe('getThreads', () => {
    beforeEach(checkAsync( async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return array of one thread', checkAsync(async (done) => {
      try {
        let threads = await Thread.getThreads();
        expect(threads.length).to.equal(1);
        expect(threads[0]._id.toString()).to.equal(threadId.toString());
        expect(threads[0]._user.username).to.equal('Mock');
        expect(threads[0].comments[0]._user.username).to.equal('Mock');
        expect(threads[0].comments[0].replies[0]._user.username).to.equal('Mock');
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should return empty array', checkAsync(async (done) => {
      try {
        let threads = await Thread.getThreads({dbQuery: {createdAt: {$lt: new Date('2015, 10, 10')}}});
        expect(threads.length).to.equal(0);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }))
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
        let thread = await Thread.updateThread(threadId, {title: ''});
        expect(thread.title).to.equal('Mock');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should mutate type', checkAsync(async (done) => {
      try {
        let thread = await Thread.updateThread(threadId, {tags: 'Test'});
        expect(thread.tags).to.contain('Test');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('likeThread', () => {
    it('should return error when thread not found', checkAsync(async (done) => {
      try {
        await Thread.likeThread(userId, '123');
      }  catch(err) {
        expect(err.name).to.equal('CastError');
      }
    }));
    
    it('should increase like', checkAsync(async (done) => {
      try {
        let thread = await Thread.likeThread(userId, threadId);
        expect(thread.likes).to.equal(1);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should decrease like', checkAsync(async (done) => {
      try {
        await Thread.likeThread(userId, threadId);
        let thread = await Thread.likeThread(userId, threadId);
        expect(thread.likes).to.equal(0);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('createComment', () => {
    it('should return error when thread not found', checkAsync(async (done) => {
      try {
        await Thread.createComment(userId, '123', 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return thread with comment', checkAsync(async (done) => {
      try {
        let thread = await Thread.createComment(userId, threadId, 'Test');
        let user = await User.findOne({_id: userId}).exec();
        expect(thread.comments[0].text).to.equal('Test');
        expect(user.profile.comments).to.equal(1);
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('updateComment', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      thread = await Thread.createComment(userId, threadId, 'Test');
    }))
    
    it('should return error when thread not found', checkAsync(async (done) => {
      try {
        await Thread.updateComment(userId, '123', '123', 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when commentId is wrong', checkAsync(async (done) => {
      try {
        await Thread.updateComment(userId, threadId, '123', 'Mock');
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when user did not create comment', checkAsync(async (done) => {
      try {
        await Thread.updateComment(threadId, threadId, thread.comments[0]._id, 'Mock');
      } catch (err) {
        expect(err.name).to.equal('Unauthorized');
      }
    }));

    it('should update comment', checkAsync(async (done) => {
      try {
        let updated = await Thread.updateComment(userId, threadId, thread.comments[0]._id, 'Mock');
        expect(updated.comments[0].text).to.equal('Mock');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('removeComment', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      thread = await Thread.createComment(userId, threadId, 'Test');
    }));

    it('should return error when thread not found', checkAsync(async (done) => {
      try {
        await Thread.removeComment(userId, '123', '123', 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when commentId is wrong', checkAsync(async (done) => {
      try {
        await Thread.removeComment(userId, threadId, '123', 'Mock');
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when user did not create comment', checkAsync(async (done) => {
      try {
        await Thread.removeComment(threadId, threadId, thread.comments[0]._id, 'Mock');
      } catch (err) {
        expect(err.name).to.equal('Unauthorized');
      }
    }));

    it('should remove comment', checkAsync(async (done) => {
      try {
        let removed = await Thread.removeComment(userId, threadId, thread.comments[0]._id, 'Mock');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('createReply', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      thread = await Thread.createComment(userId, threadId, 'Mock');
    }));

    it('should return error when thread is not found', checkAsync(async (done) => {
      try {
        await Thread.createReply(userId, '123', thread.comments[0]._id, 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when comment is not found', checkAsync(async (done) => {
      try {
        await Thread.createReply(userId, threadId, '123', 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return updated thread', checkAsync(async (done) => {
      try {
        let updated = await Thread.createReply(userId, threadId, thread.comments[0]._id, 'Test');
        let user = await User.findOne({_id: userId}).exec();
        expect(updated.comments[0].replies[0].text).to.equal('Test');
        expect(user.profile.replies).to.equal(1);
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
  });

  describe('updateReply', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      thread = await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return error when thread is not found', checkAsync(async (done) => {
      try {
        await Thread.updateReply(userId, '123', thread.comments[0]._id, thread.comments[0].replies[0]._id, 'Test');
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when comment is not found', checkAsync(async (done) => {
      try {
        await Thread.updateReply(userId, threadId, '123', thread.comments[0].replies[0]._id, 'Test');
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when reply is not found', checkAsync(async (done) => {
      try {
        await Thread.updateReply(userId, threadId, '123', thread.comments[0]._id, '123', 'Test');
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when user did not create reply', checkAsync(async (done) => {
      try {
        let updated = await Thread.updateReply('123', threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id, 'Test');
      } catch (err) {
        expect(err.name).to.be('Unauthorized');
      }
    }));

    it('should update reply', checkAsync(async (done) => {
      try {
        let updated = await Thread.updateReply(userId, threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id, 'Test');
        expect(updated.comments[0].replies[0].text).to.equal('Test');
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
    
  });

  describe('removeReply', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      thread = await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return error when thread is not found', checkAsync(async (done) => {
      try {
        await Thread.removeReply(userId, '123', thread.comments[0]._id, thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when comment is not found', checkAsync(async (done) => {
      try {
        await Thread.removeReply(userId, threadId, '123', thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when reply is not found', checkAsync(async (done) => {
      try {
        await Thread.removeReply(userId, threadId, '123', thread.comments[0]._id, '123');
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should return error when user did not create reply', checkAsync(async (done) => {
      try {
        let updated = await Thread.removeReply('123', threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.be('Unauthorized');
      }
    }));

    it('should remove reply', checkAsync(async (done) => {
      try {
        let updated = await Thread.removeReply(userId, threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id);
        expect(updated.comments[0].replies.length).to.equal(0);
      } catch (err) {
        expect(err).to.be(undefined);
      }
    }));
    
  });

  describe('likeComment', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      thread = await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return error when thread is not found', checkAsync(async (done) => {
      try {
        await Thread.likeComment(userId, '123', thread.comments[0]._id, thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when comment is not found', checkAsync(async (done) => {
      try {
        await Thread.likeComment(userId, threadId, '123', thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should like comment', checkAsync(async (done) => {
      try {
        let res = await Thread.likeComment(userId, threadId, thread.comments[0]._id);
        expect(res.comments[0].likes).to.equal(1);
        expect(res.comments[0].likesIds.toString()).to.contain(userId.toString());
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should unlike comment', checkAsync(async (done) => {
      try {
        await Thread.likeComment(userId, threadId, thread.comments[0]._id);
        let res = await Thread.likeComment(userId, threadId, thread.comments[0]._id);
        expect(res.comments[0].likes).to.equal(0);
        expect(res.comments[0].likesIds.toString()).not.to.contain(userId.toString());
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

  });
  
  describe('likeReply', () => {
    var thread;
    beforeEach(checkAsync(async (done) => {
      let res = await Thread.createComment(userId, threadId, 'Mock');
      thread = await Thread.createReply(userId, threadId, res.comments[0]._id, 'Mock');
    }));

    it('should return error when thread is not found', checkAsync(async (done) => {
      try {
        await Thread.likeReply(userId, '123', thread.comments[0]._id, thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('CastError');
      }
    }));

    it('should return error when comment is not found', checkAsync(async (done) => {
      try {
        await Thread.likeReply(userId, threadId, '123', thread.comments[0].replies[0]._id);
      } catch (err) {
        expect(err.name).to.equal('TypeError');
      }
    }));

    it('should like reply', checkAsync(async (done) => {
      try {
        let res = await Thread.likeReply(userId, threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id);
        expect(res.comments[0].replies[0].likes).to.equal(1);
        expect(res.comments[0].replies[0].likesIds.toString()).to.contain(userId.toString());
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should unlike comment', checkAsync(async (done) => {
      try {
        await Thread.likeReply(userId, threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id);
        let res = await Thread.likeReply(userId, threadId, thread.comments[0]._id, thread.comments[0].replies[0]._id);
        expect(res.comments[0].replies[0].likes).to.equal(0);
        expect(res.comments[0].replies[0].likesIds.toString()).not.to.contain(userId.toString());
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

  });
  
  
})
