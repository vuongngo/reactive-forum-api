/*
 * Event emitter to transmit message from REST API to SOCKET
 */
const EventEmitter = require('events');
const util = require('util');

function ThreadEmitter() {
  EventEmitter.call(this);
}
util.inherits(ThreadEmitter, EventEmitter);
const emiter = new ThreadEmitter();
emiter.setMaxListeners(100);

export function create(thread) {
  return emiter.emit('create', thread);
}

export function update (thread) {
  return emiter.emit('update', thread);
}

export function remove (threadId) {
  return emiter.emit('remove', threadId);
}

export function threadListerner (io) {
  emiter.on('create', data => {
    io.emit('newThread', data);
  });
  
  emiter.on('update', data => {
    io.emit('updatedThread', data);
  });

  emiter.on('remove', data => {
    io.emit('removedThread', data);
  });

  return emiter;
}

