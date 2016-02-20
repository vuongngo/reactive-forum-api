import Thread from '../models/thread';
import { checkError } from '../utils/check';
import { batchQuery } from '../utils/query';

/*
* Get thread by id
*/
export async function get(req, res, next) {
  let id = req.params.id;
  try {
    let thread = await Thread.findOne({_id: id}).exec();
    res.ok({thread: thread});
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
    res.ok({threads: threads});
  } catch (err) {
    next(err);
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
    res.created({thread: thread});
  } catch(err) {
    next(err);
  }
};

/*
* Update thread
 */

export async function update(req, res, next) {
  let id = req.params.id;
  let params = req.body;
  try {
    let thread = await Thread.updateThread(id, params);
    res.updated({thread: thread});
  } catch(err) {
    next(err);
  }
};

/*
* Delete thread
 */

export async function remove(req, res, next) {
  let id = req.params.id;
  try {
    let thread = await Thread.remove({_id: id});
    res.removed();
  } catch (err) {
    next(err);
  }
}
