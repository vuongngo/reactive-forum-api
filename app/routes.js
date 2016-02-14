import { wrap } from './utils/async';
import express from 'express';
import {
  createTopic
} from './controllers';

let router = express.Router();

router.route('/')
  .get(function(req, res) {
    res.send('Hello fuck');
  });

router.route('/topic')
 .post(wrap(createTopic));

export default router;
