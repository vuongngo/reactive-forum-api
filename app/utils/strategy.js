import User from '../models/user';
import { verifyToken } from './encryption';

export function authenticateWithToken(token, done) {
  if (!token) {
    return done({name: 'AuthError', message: 'User not signed in'});
  }
  verifyToken(token)
    .then(decoded => {
      User.findOne({token: token}, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done({name: 'AuthError', message: 'User not found'}); }
        return done(null, user, { scope: 'all'});
      })
    })
    .catch(err => {
      done(err);
    })
}
