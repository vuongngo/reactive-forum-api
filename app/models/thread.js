import mongoose from 'mongoose';
import threadSchema from '../schemas/thread';
import User from './user';
import { promisify } from '../utils/async';
import _ from 'lodash';

/*
* Create new thread
* @params params._topic{String} *
* @params params._user{String} *
* @params params.title{String} *
* @params params.body{String} *
* @params params.cardImg{String}
* @params params.tags{array}
*/
threadSchema.statics.createThread = function (params) {
  return promisify(this.create(params));
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
threadSchema.statics.updateThread = function (threadId, params) {
  params = _.pick(params, ['_topic', 'title', 'body', 'cardImg', 'tags']);
  params = _.pickBy(params, function(value) { return value != null && value.length != 0});
  return promisify(this.update({_id: threadId}, {$set: params}));
};

/*
* Like Thread
* Add userId to likeIds array and increase likes if not liked
* Remove userId from likeIds array and reduce likes if liked
* @params threadId{string}
* @params userId{string}
*/
threadSchema.statics.likeThread = function (userId, threadId) {
  var self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          return _.find(thread.likeIds, id => id.toString() === userId.toString());
        })
        .then(res => {
          if (res) {
            return self.update({_id: threadId}, {$pull: {likeIds: userId}, $inc: {likes: -1}});
          } else {
            return self.update({_id: threadId}, {$push: {likeIds: userId}, $inc: {likes: 1}});
          }
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
      })
  })
};

/*
 * Create comment
 * Add comment to comment array
 * Add contribution point to user profile
 * @params userId{string}
 * @params threadId{string}
 * @params text{string}
 */
threadSchema.statics.createComment = function (userId, threadId, text) {
  let self = this;
  return new Promise((resolve, reject) => {
    let params = {_user: userId, text: text};
    self.update({_id: threadId}, {$push: {comments: params}})
      .then(thread => {
        return User.update({_id: user._id}, {$inc: {'profile.comments': 1, 'profile.total': 1}});
      })
      .then(user => {
        resolve(user);
      })
      .catch(err => {
        reject(err);
      })
  })
};

/*
 * Update comment
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params text{string}
 */
threadSchema.statics.updateComment = function(userId, threadId, commentId, text) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          if (_.find(thread.comments, comment => comment._id === commentId)._user === userId) {
            return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$set: {'comments.$.text': text}});
          } else {
            reject({name: 'Unauthorized', message: 'User did not created this comment'});
          }
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
        })
  })
};

/*
 * Remove comment
 * Remove comment from comment array
 * Deduct contribution point from user profile
 * @params userId{string}
 * @params threadId{string}
 * @params text{string}
 */
threadSchema.statics.removeComment = function(userId, threadId, commentId, text) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          if (_.find(thread.comments, comment => comment._id === commentId)._user === userId) {
            return self.update({_id: threadId}, {$pull: {comments: {_id: commentId}}}, false, false);
          } else {
            reject({name: 'Unauthorized', message: 'User did not created this comment'});
          }
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
        })
  })
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
threadSchema.statics.createReply = function(userId, threadId, commentId, text) {
  let self = this;
  return new Promise((resolve, reject) => {
    let params = {_user: userId, text: text};
    self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$addToSet: {'comments.$.replies': params}})
      .then(thread => {
        return User.update({_id: userId}, {$inc: {'profile.replies': 1, 'profile.total': 1}});
      })
      .then(user => {
        resolve(user);
      })
      .catch(err => {
        reject(err);
    })
  })
};

/*
 * Update reply
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params replyId{string}
 * @params text{string}
 */
threadSchema.statics.updateReply = function(userId, threadId, commentId, replyId, text) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          let comment = _.find(thread.comments, comment => comment._id === commentId);
          let replyIndex = _.findIndex(comment.replies, reply => reply._id === reply);
          if (comment[replyIndex]._user !== userId) {
            reject({name: 'Unauthorized', message: 'You did not create this reply'});
          }
          return replyIndex;
        })
        .then(replyIndex => {
          let params = {};
          params['comments.$.replies.' + replyIndex + '.text'] = text;
          return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$set: params});
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
        })
  })
};

/*
 * Remove reply
 * @params userId{string}
 * @params threadId{string}
 * @params commentId{string}
 * @params replyId{string}
 */
threadSchema.statics.removeReply = function(userId, threadId, commentId, replyId) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          let comment = _.find(thread.comments, comment => comment._id === commentId);
          let replyIndex = _.findIndex(comment.replies, reply => reply._id === reply);
          if (comment[replyIndex]._user !== userId) {
            reject({name: 'Unauthorized', message: 'You did not create this reply'});
          }
          return replyIndex;
        })
        .then(replyIndex => {
          return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$pull: {'comments.$.replies': replyIndex}});
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
        })
  })
};

/*
* Like Comment
* Increase likes and add userId to likesIds if not liked
* Reduce likes and remove userId from likesIds if liked
* @params userId{string}
* @params threadId{string}
* @params commentId{string}
 */
threadSchema.statics.likeComment = function(userId, threadId, commentId) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          let comment = _.find(thread.comments, comment => comment._id === commentId);
          let hasUser = _.find(comment.likesIds, id => id === userId);
          if (hasUser) {
            return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: {'comments.$.likes': -1}, $pull: {'comments.$.likesIds': userId}});
          } else {
            return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: {'comments.$.likes': 1}, $push: {'comments.$.likesIds': userId}});
          }
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
      })
  })
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
threadSchema.statics.likeReply = function (userId, threadId, commentId, replyId) {
  var self = this;
  return new Promise((resolve, reject) => {
    self.findOne({_id: threadId})
        .exec()
        .then(thread => {
          let comment = _.find(thread.comments, comment => comment._id === commentId);
          let replyIndex = _.findIndex(comment.replies, reply => reply._id === reply);
          return {index: replyIndex, alreadyLiked: _.find(comment[replyIndex].likesIds, id => id === userId)};
        })
        .then(res => {
          let paramsId = {};
          let params = {};
          if (res.alreadyLiked) {
            paramsId["comments.$.replies." + res.index + ".likeIds"] = userId;
            params["comments.$.replies." + res.index + ".likes"] = -1;
            return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: params, $pull: paramsId});            
          } else {
            paramsId["comments.$.replies." + res.index + ".likeIds"] = userId;
            params["comments.$.replies." + res.index + ".likes"] = 1;
            return self.update({_id: threadId, comments: {$elemMatch: {_id: commentId}}}, {$inc: params, $push: paramsId});            
          }
        })
        .then(thread => {
          resolve(thread);
        })
        .catch(err => {
          reject(err);
        })
  })
};



let Thread = mongoose.model('Thread', threadSchema);
export default Thread;
