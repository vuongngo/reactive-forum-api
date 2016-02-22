/*
 * Event emitter to transmit message from REST API to SOCKET
 */
const EventEmitter = require('events');
const util = require('util');

function CommentEmitter() {
  EventEmitter.call(this);
}
util.inherits(CommentEmitter, EventEmitter);
const emiter = new CommentEmitter();
emiter.setMaxListeners(100);

export function create(thread) {
  return emiter.emit('create', {threadId: thread._id, comment: thread.comments[thread.comments.length -1]});
}

export function update (thread, commentId) {
  let comment = thread.comments.find(comment => comment._id.toString() === commentId.toString());
  return emiter.emit('update', {threadId: thread._id, comment: comment});
}

export function remove (threadId, commentId) {
  return emiter.emit('remove', {threadId: threadId, commentId: commentId});
}

export function commentListerner (io) {
  emiter.on('create', data => {
    io.emit('newComment', data);
  });
  
  emiter.on('update', data => {
    io.emit('updatedComment', data);
  });

  emiter.on('remove', data => {
    io.emit('removedComment', data);
  });

  return emiter;
}
