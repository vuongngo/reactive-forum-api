import mongoose from 'mongoose';
import _ from 'lodash';
import crypto from 'crypto';
import userSchema from '../schemas/user';
import { promisify } from '../utils/async';

/*
* @params params.username{string}
* @params params.password{string}
*/
userSchema.statics.signupUser = function (params) {
  let self = this;
  // promisify for async function
  return new Promise(function (resolve, reject) {
    let password = params.password;
    params = _.pick(params, ['email', 'username']);
    // Encryption with PBKDF2
    crypto.randomBytes(128, function(err, salt) {
      if (err) { reject(err); }
      salt = new Buffer(salt).toString('hex');
      crypto.pbkdf2(password, salt, 7000, 256, function (err, hash) {
        if (err) { reject(err); }
        params.salt = salt;
        params.hash = hash.toString('hex');
        // Create new user with salt and hash
        self.create(params, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(_.pick(res, ['_id', 'username']));
          }
        });
      });
    });
  })
};

/*
* @params params.username{string}
* @params params.password(string)
*/
userSchema.statics.signinUser = function (params) {
  let self = this;
  return new Promise((resolve, reject) => {
    let password = params.password;
    params = _.pick(params, ['username', 'email']);
    self.findOne(params, (err, res) => {
      if (err) { reject(err); }
      crypto.pbkdf2(password, res.salt, 7000, 256, (err, hash) => {
        if (err) { reject(err); }
        if (res.hash !== hash.toString('hex')) { reject({name: 'Unauthenticated', message: 'Wrong password'})}
        resolve(_.pick(res, ['_id', 'username']));
      });
    });
  });
};

/*
* @params query{object}
* @params skip{integer}
* @params limit{integer}
*/
userSchema.statics.getUsers = function (query, skip, limit) {
  return promisify(this.find(query).skip(skip).limit(limit).select('username profile').exec());
};

/*
* Flag thread
* Add threadId to user profile flags if not flagged
*  Remove threadId from user profile flags if flagged
* @params userId{string}
* @params threadId{string}
 */
userSchema.statics.flagThread = function (userId, threadId) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: userId})
        .exec()
        .then(user => {
          if (_.find(user.profile.flags, id => id.toString() === threadId.toString())) {
            return self.update({_id: userId}, {$pull: {'profile.flags': threadId}});
          } else {
            return self.update({_id: userId}, {$addToSet: {'profile.flags': threadId}});
          }
        })
        .then(user => {
          resolve(user);
        })
        .catch(err => {
          reject(err);
      })
  })
};

let User = mongoose.model('User', userSchema);
export default User;
