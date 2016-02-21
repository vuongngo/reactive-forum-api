import Thread from '../models/thread';
import _ from 'lodash';

/*
 * Create reply
 */
export async function create(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  let text = req.body.text;
  try {
    let thread = await Thread.createReply(userId, threadId, commentId, text);
    return res.ok({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Update reply
 */
export async function update(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  let replyIndex = req.replyIndex;
  let text = req.body.text;
  try {
    let thread = await Thread.updateReply(userId, threadId, commentId, replyIndex, text);
    return res.ok({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Delete reply
 */

export async function remove(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  let replyId = req.params.replyId;
  try {
    await Thread.removeReply(userId, threadId, commentId, replyId);
    return res.ok();
  } catch (err) {
    return next(err);
  }
}

/*
 * Like reply
 */

export async function like(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  let replyId = req.params.replyId;
  try {
    let thread = await Thread.likeReply(userId, threadId, commentId, replyId);
    return res.ok({thread: thread});
  } catch (err) {
    return next(err);
  }
}
