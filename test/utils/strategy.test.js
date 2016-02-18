import { authenticateWithToken } from '../../app/utils/strategy';
import { genToken, verifyToken } from '../../app/utils/encryption';
import expect from 'expect.js';
import User from '../../app/models/user';

describe('Strategy test', () => {
  var user;
  var token;
  
  beforeEach(done => {
    User.signupUser({username: 'Mock', password: '123456'})
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
        .catch(err => { done(); });
  });
  
  afterEach(done => {
    User.remove({}, (err, res) => {
      done();
    })
  });

  it('should return user from valid token', done => {
    authenticateWithToken(token, (err, res) => {
      expect(res._id.toString()).to.equal(user._id.toString());
      done();
    });
  });

  it('should return error from invalid token', done => {
    authenticateWithToken(token + '1', (err, res) => {
      expect(err.name).to.equal('JsonWebTokenError');
      done();
    });
  });
  
})
