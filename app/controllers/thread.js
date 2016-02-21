import Thread from '../models/thread';
import { checkKeys } from '../utils/check';
import { batchQuery } from '../utils/query';
import _ from 'lodash';

/*
 * Get thread by id
 */
export async function get(req, res, next) {
  let id = req.params.threadId;
  try {
    let thread = await Thread.getThreadById(id);
    return res.ok({thread: thread});
  } catch (err) {
    return next(err);
  };
};

/*
 * Get threads by query
 */
export async function getBatch(req, res, next) {
  try {
    let threads = await Thread.getThreads(batchQuery(req));
    return res.ok({threads: threads});
  } catch (err) {
    return next(err);
  }
};

/*
 * Create thread
 */
export async function create(req, res, next) {
  let params = _.pick(req.body, ['_topic', 'title', 'body']);
  params._user = req.user._id;
  if (checkKeys(params)) {
    return res.badRequest(checkKeys(params));
  }
  params.cardImg = req.body.cardImg;
  params.tags = req.body.tags;
  try {
    let thread = await Thread.createThread(params);
    return res.created({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Update thread
 */
export async function update(req, res, next) {
  let id = req.params.threadId;
  let params = req.body;
  try {
    let thread = await Thread.updateThread(id, params);
    return res.ok({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Delete thread
 */

export async function remove(req, res, next) {
  let id = req.params.threadId;
  try {
    let thread = await Thread.remove({_id: id});
    return res.removed();
  } catch (err) {
    return next(err);
  }
}

/*
 * Like thread
 */

export async function like(req, res, next) {
  let userId = req.user._id;
  let id = req.params.threadId;
  try {
    let thread = await Thread.likeThread(userId, id);
    return res.ok({thread: thread});
  } catch (err) {
    return next(err);
  }
}
