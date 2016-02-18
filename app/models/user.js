import mongoose from 'mongoose';
import _ from 'lodash';
import crypto from 'crypto';
import userSchema from '../schemas/user';
import { promisify } from '../utils/async';

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

userSchema.statics.getUsers = function (query, skip, limit) {
  return promisify(User.find(query).skip(skip).limit(limit).select('username profile').exec());
};

let User = mongoose.model('User', userSchema);
export default User;
