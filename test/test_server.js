import express from 'express';
import bodyParser from 'body-parser';
import Router from '../app/routes';
import {
  logErrors,
  clientErrorHandler,
  errorHandler
} from '../app/utils/error-middleware';
import  Responses from '../app/utils/responses';
express.response = Object.assign(express.response, Responses);

export default function createServer() {
  var app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use('/api', Router);
  app.use(logErrors);
  app.use(clientErrorHandler);
  app.use(errorHandler);

  let port = process.env.PORT || 8080;
  let server = app.listen(port, () => {
    console.log('server rerun');
  });
  return server;
}
