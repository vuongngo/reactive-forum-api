import express from 'express';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';
import Router from './app/routes';
import mongoose from 'mongoose';
import {
  logErrors,
  clientErrorHandler,
  serverErrorHandler
} from './app/middlewares/error-middleware';
import  Responses from './app/utils/responses';
import { threadListerner } from './app/socket/thread';
import { commentListerner } from './app/socket/comment';
import { replyListerner } from './app/socket/reply';

express.response = Object.assign(express.response, Responses);

var app = express();

switch (process.env.NODE_ENV) {
  case 'production':
    mongoose.connect('localhost', 'forum');
    break;
  case 'development':
    mongoose.connect('localhost', 'forum');
    break;
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api', Router);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(serverErrorHandler);

let port = process.env.PORT || 3000;
let server = app.listen(port, () => {
  let port = server.address().port;
  console.log('Example app listening at port %s', port);
});
const io = socketIo(server);
io.on('connection', socket => {
  socket.emit('Greeting', 'Hi there');
  threadListerner(socket);
  commentListerner(socket);
  replyListerner(socket);
});
module.exports = server;
