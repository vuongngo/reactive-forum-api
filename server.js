import express from 'express';
import bodyParser from 'body-parser';
import Router from './app/routes';
import mongoose from 'mongoose';
import {
  logErrors,
  clientErrorHandler,
  errorHandler
} from './app/utils/error-middleware';
import  Responses from './app/utils/responses';
express.response = Object.assign(express.response, Responses);

var app = express();

mongoose.connect('localhost', 'forum');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api', Router);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

let port = process.env.PORT || 3000;
app.listen(port);
