import Thread from '../models/thread';
import _ from 'lodash';

/*
 * Create comment
 */
export async function create (req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let text = req.body.text;
  try {
    let thread = await Thread.createComment(userId, threadId, text);
    return res.ok({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Update comment
 */
export async function update(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  let text = req.body.text;
  try {
    let thread = await Thread.updateComment(userId, threadId, commentId, text);
    return res.ok({thread: thread});
  } catch(err) {
    return next(err);
  }
};

/*
 * Delete comment
 */

export async function remove(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  try {
    await Thread.removeComment(userId, threadId, commentId);
    return res.removed();
  } catch (err) {
    return next(err);
  }
}

/*
 * Like comment
 */

export async function like(req, res, next) {
  let userId = req.user._id;
  let threadId = req.params.threadId;
  let commentId = req.params.commentId;
  try {
    let thread = await Thread.likeComment(userId, threadId, commentId);
    return res.ok({thread: thread});
  } catch (err) {
    return next(err);
  }
}
