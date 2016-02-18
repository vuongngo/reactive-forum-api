import { wrap } from './utils/async';
import express from 'express';
import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import {
  auth,
  user,
  topic
} from './controllers';
import { authenticateWithToken } from './utils/strategy';
import authorize from './middlewares/authorization';

passport.use(new BearerStrategy(authenticateWithToken));
let authenticate = passport.authenticate('bearer', {session: false});

let router = express.Router();

router.route('/')
  .get(function(req, res) {
    res.send('Hello yo');
  });

// Session routes
router.post('/signup', wrap(auth.signup));
router.post('/signin', wrap(auth.signin));
router.post('/signout', authenticate, wrap(auth.signout));

/*
 * Wrapper for protected route to make it more DRY
 * @params route{String}
 * @params route{String}
 * @params roles{array} ['admin', 'self', 'owner']
 * @params route{function}
 */

function protectedUserRoute(route, prop, roles, controller) {
  return router[prop](route, authenticate, authorize(roles), wrap(controller));
}

router.get('/users', wrap(user.getBatch));
router.get('/user/:userId', wrap(user.get));
protectedUserRoute('/user/:userId', 'put', ['self'], user.update);
protectedUserRoute('/user/:userId', 'delete', ['admin', 'self'], user.remove);
  
/*
 * Wrapper for protected route to make it more DRY
 * @params route{String}
 * @params route{String}
 * @params route{function}
 */

function protectedTopicRoute(route, prop, controller) {
  return router[prop](route, authenticate, authorize(['admin']), wrap(controller));
}

router.get('/topics', wrap(topic.getBatch));
router.get('/topic/:id', wrap(topic.get));
protectedTopicRoute('/topic', 'post', topic.create);
protectedTopicRoute('/topic/:id', 'put', topic.update);
protectedTopicRoute('/topic/:id', 'delete', topic.remove);

export default router;
