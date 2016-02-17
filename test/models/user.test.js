import expect from 'expect.js';
import { checkAsync } from '../utils/check';
import User from '../../app/models/user';

describe('Topic static methods', () => {
  beforeEach(done => {
    User.signupUser({username: 'Mock', password: '123456'})
        .then(() => { done(); })
        .catch(err => {console.log(err); done(); });
  });
  
  afterEach(done => {
    User.remove({}, (err, res) => {
      done();
    })
  });

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
})
