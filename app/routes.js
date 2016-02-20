import { wrap } from './utils/async';
import express from 'express';
import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import {
  auth,
  user,
  topic,
  thread
} from './controllers';
import { authenticateWithToken } from './utils/strategy';
import authorize from './middlewares/authorization';
import Thread from './models/thread';

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
 * @params prop{String}
 * @params roles{array} ['admin', 'self', 'owner']
 * @params controller{function}
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
 * @params prop{String}
 * @params controller{function}
 */

function protectedTopicRoute(route, prop, controller) {
  return router[prop](route, authenticate, authorize(['admin']), wrap(controller));
}

router.get('/topics', wrap(topic.getBatch));
router.get('/topic/:id', wrap(topic.get));
protectedTopicRoute('/topic', 'post', topic.create);
protectedTopicRoute('/topic/:id', 'put', topic.update);
protectedTopicRoute('/topic/:id', 'delete', topic.remove);

/*
* Wrapper for protected route to make it more DRY
* @params route{String}
* @params prop{String}
* @params roles{array}
* @params model{object}
* @params controller{function}
*/
function protectedThreadRoute(route, prop, roles, model, controller) {
  return router[prop](route, authenticate, authorize(roles, model), wrap(controller));
}
router.get('/threads', wrap(thread.getBatch));
router.get('/thread/:id', wrap(thread.get));
protectedThreadRoute('/thread', 'post', thread.create);
protectedThreadRoute('/thread/:id', 'put', ['admin', 'owner'], Thread, thread.update);
protectedThreadRoute('/thread/:id', 'delete',['admin', 'owner'], Thread,  thread.remove);

export default router;
