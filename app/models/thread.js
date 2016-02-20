import mongoose from 'mongoose';
import threadSchema from '../schemas/thread';
import User from './user';
import { promisify } from '../utils/async';
import _ from 'lodash';

/*
* Get thread by id
* @params id{string}
 */
threadSchema.statics.getThreadById = function (id) {
  return promisify(this.findOne({_id: id})
                       .deepPopulate('_user comments._user comments.replies._user')
                       .exec()
  );
};

/*
 * @params query{object}
 * @params skip{integer}
 * @params limit{integer}
 */
threadSchema.statics.getThreads = function (params) {
  if (typeof params === 'undefined') {
    params = {};
  };
  let {dbQuery, skip, limit} = params;
  return promisify(this.find(dbQuery)
                       .skip(skip)
                       .limit(limit)
                       .deepPopulate('_user comments._user comments.replies._user')
                       .exec()
  );
};

/*
* Create new thread
* @params params._topic{String} *
* @params params._user{String} *
* @params params.title{String} *
* @params params.body{String} *
* @params params.cardImg{String}
* @params params.tags{array}
*/
threadSchema.statics.createThread = async function (params) {
  try {
    let thread = await this.create(params);
    return this.findOne({_id: thread._id}).deepPopulate('_user').exec();
  } catch(err) {
    return(err);
  }
};

/*
* Update thread
* @params threadId{string}
* @params params._topic{String}
* @params params.title{String}
* @params params.body{String}
* @params params.cardImg{String}
* @params params.tags{array}
 */
threadSchema.statics.updateThread = async function (threadId, params) {
  params = _.pick(params, ['_topic', 'title', 'body', 'cardImg', 'tags']);
  params = _.pickBy(params, function(value) { return value != null && value.length != 0});
  try {
    let res = await this.update({_id: threadId}, {$set: params});
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
* Like Thread
* Add userId to likeIds array and increase likes if not liked
* Remove userId from likeIds array and reduce likes if liked
* @params threadId{string}
* @params userId{string}
*/
threadSchema.statics.likeThread = async function (userId, threadId) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    if (_.find(thread.likeIds, id => id.toString() === userId.toString())) {
      await this.update({_id: threadId}, {$pull: {likeIds: userId}, $inc: {likes: -1}});
    } else {
      await this.update({_id: threadId}, {$push: {likeIds: userId}, $inc: {likes: 1}});
    }
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
 * Create comment
 * Add comment to comment array
 * Add contribution point to user profile
 * @params userId{string}
 * @params threadId{string}
 * @params text{string}
 */
threadSchema.statics.createComment = async function (userId, threadId, text) {
  let params = {_user: userId, text: text};
  try {
    await this.update({_id: threadId}, {$push: {comments: params}});
    await User.update({_id: userId}, {$inc: {'profile.comments': 1, 'profile.total': 1}});
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
 * Update comment
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params text{string}
 */
threadSchema.statics.updateComment = async function(userId, threadId, commentId, text) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    if (_.find(thread.comments, comment => comment._id.toString() === commentId.toString())._user.toString() === userId.toString()) {
      await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$set: {'comments.$.text': text}});
    } else {
      throw new Error({name: 'Unauthorized', message: 'User did not created this comment'});
    }
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
 * Remove comment
 * Remove comment from comment array
 * Deduct contribution point from user profile
 * @params userId{string}
 * @params threadId{string}
 * @params text{string}
 */
threadSchema.statics.removeComment = async function(userId, threadId, commentId, text) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    if (_.find(thread.comments, comment => comment._id.toString() === commentId.toString())._user.toString() === userId.toString()) {
      await this.update({_id: threadId}, {$pull: {comments: {_id: commentId}}}, false, false);
    } else {
      throw new Error({name: 'Unauthorized', message: 'User did not created this comment'});
    }
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
* Create reply
* Add reply to replies array in comment
* Add contribution point to profile
* @params userId{string}
* @params threadId{string}
* @params commentId{string}
* @params text{string}
 */
threadSchema.statics.createReply = async function(userId, threadId, commentId, text) {
  let params = {_user: userId, text: text};
  try {
    await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$addToSet: {'comments.$.replies': params}});
    await User.update({_id: userId}, {$inc: {'profile.replies': 1, 'profile.total': 1}});
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
 * Update reply
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params replyId{string}
 * @params text{string}
 */
threadSchema.statics.updateReply = async function(userId, threadId, commentId, replyId, text) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    let comment = _.find(thread.comments, comment => comment._id.toString() === commentId.toString());
    let replyIndex = _.findIndex(comment.replies, reply => reply._id.toString() === replyId.toString());
    if (comment.replies[replyIndex]._user.toString() !== userId.toString()) {
      throw new Error({name: 'Unauthorized', message: 'You did not create this reply'});
    }
    let params = {};
    params['comments.$.replies.' + replyIndex + '.text'] = text;
    await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$set: params});
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
 * Remove reply
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params replyId{string}
 */
threadSchema.statics.removeReply = async function(userId, threadId, commentId, replyId) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    let comment = _.find(thread.comments, comment => comment._id.toString() === commentId.toString());
    let reply = _.find(comment.replies, reply => reply._id.toString() === replyId.toString());
    if (reply._user.toString() !== userId.toString()) {
      throw new Error({name: 'Unauthorized', message: 'You did not create this reply'});
    }
    await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$pull: {'comments.$.replies': {_id: replyId}}});
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
* Like Comment
* Increase likes and add userId to likesIds if not liked
* Reduce likes and remove userId from likesIds if liked
* @params userId{string}
* @params threadId{string}
* @params commentId{string}
 */
threadSchema.statics.likeComment = async function(userId, threadId, commentId) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    let comment = _.find(thread.comments, comment => comment._id.toString() === commentId.toString());
    let hasUser = _.find(comment.likesIds, id => id.toString() === userId.toString());
    if (hasUser) {
      await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: {'comments.$.likes': -1}, $pull: {'comments.$.likesIds': userId}});
    } else {
      await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: {'comments.$.likes': 1}, $push: {'comments.$.likesIds': userId}});
    }
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};

/*
* Like reply
 * Increase likes and add userId to likesIds if not liked
* REduce likes and remove userId from likesIds if liked
* @params userId{string}
* @params threadId{string}
* @params commentId{string}
* @params replyId{string}
 */
threadSchema.statics.likeReply = async function (userId, threadId, commentId, replyId) {
  try {
    let thread = await this.findOne({_id: threadId}).exec();
    let comment = _.find(thread.comments, comment => comment._id.toString() === commentId.toString());
    let replyIndex = _.findIndex(comment.replies, reply => reply._id.toString() === replyId.toString());
    let paramsId = {};
    let params = {};
    if (_.find(comment.replies[replyIndex].likesIds, id => id.toString() === userId.toString())) {
      paramsId["comments.$.replies." + replyIndex + ".likesIds"] = userId;
      params["comments.$.replies." + replyIndex + ".likes"] = -1;
      await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: params, $pull: paramsId});            
    } else {
      paramsId["comments.$.replies." + replyIndex + ".likesIds"] = userId;
      params["comments.$.replies." + replyIndex + ".likes"] = 1;
      await this.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: params, $push: paramsId});            
    }
    return await this.getThreadById(threadId);
  } catch (err) {
    return err;
  }
};



let Thread = mongoose.model('Thread', threadSchema);
export default Thread;
