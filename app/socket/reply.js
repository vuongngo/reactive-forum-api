/*
 * Event emitter to transmit message from REST API to SOCKET
 */
const EventEmitter = require('events');
const util = require('util');

function ReplyEmitter() {
  EventEmitter.call(this);
}
util.inherits(ReplyEmitter, EventEmitter);
const emiter = new ReplyEmitter();
emiter.setMaxListeners(100);

export function create(thread, commentId) {
  let comment = thread.comments.find(comment => comment._id.toString() === commentId.toString());
  return emiter.emit('create',
                     {
                       threadId: thread._id,
                       commentId: commentId,
                       reply: comment.replies[comment.replies.length -1]
                     });
}

export function update (thread, commentId, replyId) {
  let comment = thread.comments.find(comment => comment._id.toString() === commentId.toString());
  let reply = comment.replies.find(reply => reply._id.toString() === replyId.toString());
  return emiter.emit('update',
                     {
                       threadId: thread._id,
                       commentId: commentId,
                       reply: reply
                     });
}

export function remove (threadId, commentId, replyId) {
  return emiter.emit('remove',
                     {
                       threadId: threadId,
                       commentId: commentId,
                       replyId: replyId
                     });
}

export function replyListerner (io) {
  emiter.on('create', data => {
    io.emit('newReply', data);
  });
  
  emiter.on('update', data => {
    io.emit('updatedReply', data);
  });

  emiter.on('remove', data => {
    io.emit('removedReply', data);
  });

  return emiter;
}
