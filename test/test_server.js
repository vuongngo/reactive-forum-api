import express from 'express';
import bodyParser from 'body-parser';
import Router from '../app/routes';
import {
  logErrors,
  clientErrorHandler,
  serverErrorHandler
} from '../app/utils/error-middleware';
import  Responses from '../app/utils/responses';
express.response = Object.assign(express.response, Responses);

export default function createServer() {
  var app = express();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use('/api', Router);
  app.use(logErrors);
  app.use(clientErrorHandler);
  app.use(serverErrorHandler);

  let port = 8080;
  let server = app.listen(port, () => {
    var port = server.address().port;
    console.log('Example app listening at port %s', port);
  });
  return server;
}
