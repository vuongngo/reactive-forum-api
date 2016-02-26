/*
* User controller
*/
import User from '../models/user';
import { checkKeys } from '../utils/check';
import { batchQuery, getImg } from '../utils/query';
import _ from 'lodash';

/*
* Get user on userId
*/
export async function get(req, res, next) {
  const id = req.params.userId;
  try {
    let user = await User.findOne().where('_id').equals(id).select('username profile').exec();
    return res.ok({user: user});
  } catch (err) {
    return next(err);
  }
}

/*
* Get users using mongo liked query
* Eg:
* /users?limit=20&_id=in:[array of ids]&sort=username:1&page=9
*/
export async function getBatch(req, res, next) {
  try {
    let users = await User.getUsers(batchQuery(req));
    return res.ok({users: users});
  } catch (err) {
    return next(err);
  }
}

/*
* Update user on userId
*/
export async function update(req, res, next) {
  const id = req.params.userId;
  let { username, firstName, lastName, avatar } = req.body;
  let params = {username: username, 'profile.firstName': firstName, 'profile.lastName': lastName, 'profile.avatar': getImg(req, 'avatar')};
  params = _.pickBy(params, _.isString);
  try {
    let user = await User.update({_id: id}, {$set: params});
    return res.updated();
  } catch (err) {
    return next(err);
  }
}

/*
* Remove user on userId
*/
export async function remove(req, res, next) {
  const id = req.params.userId;
  try {
    let user = await User.remove({_id: id});
    return res.removed();
  } catch (err) {
    return next(err);
  }
}
