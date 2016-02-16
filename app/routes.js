import { wrap } from './utils/async';
import express from 'express';
import {
  getTopic,
  createTopic,
  updateTopic,
  removeTopic,
  getTopics
} from './controllers';

let router = express.Router();

router.route('/')
  .get(function(req, res) {
    res.send('Hello fuck');
  });

router.route('/topics')
      .get(wrap(getTopics));

router.route('/topic')
      .post(wrap(createTopic));

router.route('/topic/:id')
      .get(wrap(getTopic))
      .put(wrap(updateTopic))
      .delete(wrap(removeTopic));

export default router;
