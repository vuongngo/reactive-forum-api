/*
* User controller
*/
import User from '../models/user';
import { checkKeys } from '../utils/check';
import _ from 'lodash';

/*
* Get user on userId
*/
export async function get(req, res, next) {
  const id = req.params.userId;
  try {
    let user = await User.findOne().where('_id').equals(id).select('username profile').exec();
    res.ok({user: user});
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
  let query = req.query;
  let limit = req.query.limit || 10;
  let skip = req.query.page * 10 || 0;
  query = _.omit(query, ['limit', 'page', 'desc']);
  let dbQuery = _.mapValues(query, function(value) {
    let arr = value.split(':').map(e => e.trim());
    if (arr.length > 1) {
      const key = arr.shift();
      let obj = {};
      obj[`\$${key}`] = arr.join(':');
      return obj;
    } else {
      return value;
    }
  });
  try {
    let users = await User.getUsers(dbQuery, skip, limit);
    res.ok({users: users});
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
  let params = {username: username, 'profile.firstName': firstName, 'profile.lastName': lastName, 'profile.avatar': avatar};
  params = _.pickBy(params, _.isString);
  try {
    let user = await User.update({_id: id}, {$set: params});
    res.updated();
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
    res.removed();
  } catch (err) {
    return next(err);
  }
}
