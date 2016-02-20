import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import User from '../../app/models/user';
import Thread from '../../app/models/thread';
import Topic from '../../app/models/topic';

describe('User static methods', () => {
  var userId;
  var threadId;
  beforeEach(checkAsync(async (done) => {
    let user = await User.signupUser({username: 'Mock', password: '123456'});
    userId = user._id;
    let topic = await Topic.create({name: 'Mock'});
    let thread = await Thread.create({_topic: topic._id, _user: userId, title: 'Mock', body: 'Mock'});
    threadId = thread._id;
  }));

  afterEach(checkAsync(async (done) => {
    await User.remove({});
    await Topic.remove({});
    await Thread.remove({});
  }));

  describe('signupUser', () => {
    it('should return error when username is missing', checkAsync( async (done) => {
      try {
        let user = await User.signupUser({username: '', password: '123456'});
      } catch (err) {
        expect(err.message).to.contain('User validation failed');
        expect(err.errors.username.message).to.contain('Path `username` is required');
      }
    }));

    it('should return user', checkAsync( async (done) => {
      let user = await User.signupUser({username: 'Test', password: '123456'});
      expect(user).to.have.property('_id');
      expect(user.username).to.equal('Test');
    }));
  });

  describe('signInUser', () => {
    it('should return error when user use wrong password', checkAsync(async (done) => {
      try {
        let user = await User.signinUser({username: 'Mock', password: '12345'});
      } catch (err) {
        expect(err.message).to.contain('Wrong password');
        expect(err.name).to.contain('Unauthenticated');
      }
    }));
    
    it('should return user', checkAsync(async (done) => {
      let user = await User.signinUser({username: 'Mock', password: '123456'});
      expect(user).to.have.property('_id');
      expect(user.username).to.equal('Mock');
    }));
  });

  describe('flagThread', () => {
    it('should return error when user is not exist', checkAsync(async (done) => {
      try {
        let user = await User.flagThread('123', '123');
      } catch (err) {
        expect(err.message).to.contain('Cast to');
      }
    }));

    it('should return doc when user updated', checkAsync(async (done) => {
      try {
        await User.flagThread(userId, threadId);
        let user = await User.findOne({_id: userId}).exec();
        expect(user.profile.flags.length).to.equal(1);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));

    it('should return error when user is not exist', checkAsync(async (done) => {
      try {
        await User.update({_id: userId} , {$addToSet: {'profile.flags': threadId}});
        await User.flagThread(userId, threadId);
        let user = await User.findOne({_id: userId}).exec();
        expect(user.profile.flags.length).to.equal(0);
      } catch(err) {
        expect(err).to.be(undefined);
      }
    }));
    
  });

})
