import User from '../models/user';
import { genToken, verifyToken } from '../utils/encryption';
import { checkKeys, checkError } from '../utils/check';
import _ from 'lodash';

export async function signupUser(req, res, next) {
  let params = _.pick(req.body, ['username', 'password']);
  if (checkKeys(params)) {
    res.badRequest(checkKeys(params));
  }
  try {
    let user = await User.signupUser(params);
    let token = await genToken(user);
    res.created({user: user, token: 'Bearer ' + token});
  } catch (err) {
    next(err);
  }
};

export async function signinUser(req, res, next) {
  let params = _.pick(req.body, ['username', 'password']);
  if (checkKeys(params)) {
    res.badRequest(checkKeys(params));
  }
  try {
    let user = await User.signinUser(params);
    let token = await genToken(user);
    res.ok({user: user, token: 'Bearer ' + token});
  } catch (err) {
    next(err);
  }
};
