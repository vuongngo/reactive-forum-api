import User from '../models/user';
import { genToken, verifyToken } from '../utils/encryption';
import { checkKeys, checkError } from '../utils/check';
import _ from 'lodash';

export async function signupUser(req, res, next) {
  let params = _.pick(req.body, ['username', 'password']);
  if (checkKeys(params)) {
    return res.badRequest(checkKeys(params));
  }
  try {
    let user = await User.signupUser(params);
    let token = await genToken(user);
    await User.where({_id: user._id}).update({$set: {token: token}});
    res.created({user: user, token: 'Bearer ' + token});
  } catch (err) {
    return next(err);
  }
};

export async function signinUser(req, res, next) {
  let params = _.pick(req.body, ['username', 'password']);
  if (checkKeys(params)) {
    return res.badRequest(checkKeys(params));
  }
  try {
    let user = await User.signinUser(params);
    let token = await genToken(user);
    await User.where({_id: user._id}).update({$set: {token: token}});
    res.ok({user: user, token: 'Bearer ' + token});
  } catch (err) {
    return next(err);
  }
};

export async function signoutUser(req, res, next) {
  try {
    await User.where({_id: req.user._id}, {$unset: {token: 1}});
    res.updated();
  } catch (err) {
    return next(err);
  }
};
