import Thread from '../models/thread';
import { checkKeys } from '../utils/check';
import { batchQuery } from '../utils/query';
import _ from 'lodash';
import * as threadEmiter from '../socket/thread';
import { getImg } from '../utils/query';

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
  params.tags = req.body.tags; 
  params.cardImg = getImg(req, 'cardImg'); 
  try {
    let thread = await Thread.createThread(params);
    threadEmiter.create(thread); 
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
  params.cardImg = getImg(req, 'cardImg'); 
  try {
    let thread = await Thread.updateThread(id, params);
    threadEmiter.update(thread);
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
    threadEmiter.remove(id);
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
    threadEmiter.update(thread);
    return res.ok({thread: thread});
  } catch (err) {
    return next(err);
  }
}

