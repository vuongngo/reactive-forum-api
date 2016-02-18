import { wrap } from './utils/async';
import express from 'express';
import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import * as Controllers from './controllers';
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
router.post('/signup', wrap(Controllers.signupUser));
router.post('/signin', wrap(Controllers.signinUser));
router.post('/signout', authenticate, wrap(Controllers.signoutUser));

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

router.get('/users', wrap(Controllers.getUsers));
router.get('/user/:userId', wrap(Controllers.getUser));
protectedUserRoute('/user/:userId', 'put', ['self'], Controllers.updateUser);
protectedUserRoute('/user/:userId', 'delete', ['admin', 'self'], Controllers.removeUser);
  
/*
 * Wrapper for protected route to make it more DRY
 * @params route{String}
 * @params route{String}
 * @params route{function}
 */

function protectedTopicRoute(route, prop, controller) {
  return router[prop](route, authenticate, authorize(['admin']), wrap(controller));
}

router.get('/topics', wrap(Controllers.getTopics));
router.get('/topic/:id', wrap(Controllers.getTopic));
protectedTopicRoute('/topic', 'post', Controllers.createTopic);
protectedTopicRoute('/topic/:id', 'put', Controllers.updateTopic);
protectedTopicRoute('/topic/:id', 'delete', Controllers.removeTopic);

export default router;
