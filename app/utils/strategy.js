import User from '../models/user';
import { verifyToken } from './encryption';

export function authenticateWithToken(token, done) {
  verifyToken(token)
    .then(decoded => {
      User.findOne({token: token}, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done({name: 'AuthError', message: 'User not found'}); }
        if (user._id.toString() !== decoded._id.toString()) { return done({name: 'AuthError', message: 'Wrong user'}); }
        return done(null, user, { scope: 'all'});
      })
    })
    .catch(err => {
      done(err);
    })
}
