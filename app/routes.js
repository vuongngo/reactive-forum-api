import { wrap } from './utils/async';
import express from 'express';
import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import {
  auth,
  user,
  topic,
  thread,
  comment,
  reply
} from './controllers';
import { authenticateWithToken } from './utils/strategy';
import authorize from './middlewares/authorization';
import Thread from './models/thread';
import _ from 'lodash';

passport.use(new BearerStrategy(authenticateWithToken));
let authenticate = passport.authenticate('bearer', {session: false});

let router = express.Router(); 

router.route('/')
  .get(function(req, res, next) {
    return res.send('Hello yo');
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
 * @params controller{function}
 */
function protectedThreadRoute(route, prop, roles, controller) {
  return router[prop](route, authenticate, authorize(roles), wrap(controller));
}
// Validate thread
router.param('threadId', wrap( async (req, res, next) => {
  try {
    let thread = await Thread.findOne({_id: req.params.threadId}).exec();
    req.obj = thread;
    return next();
  } catch(err) {
    return next(err);
  }
}));

router.get('/threads', wrap(thread.getBatch));
router.get('/thread/:threadId', wrap(thread.get));
router.get('/thread/:threadId/like', authenticate, wrap(thread.like));
router.post('/thread', authenticate, wrap(thread.create));
protectedThreadRoute('/thread/:threadId', 'put', ['admin', 'owner'], thread.update);
protectedThreadRoute('/thread/:threadId', 'delete',['admin', 'owner'],  thread.remove);


/*
 * Comment router is nested inside router
 */
let commentRouter = express.Router({mergeParams: true});
router.use('/thread/:threadId/comment', commentRouter);

/*
 * Wrapper for protected route to make it more DRY
 * @params route{String}
 * @params prop{String}
 * @params roles{array}
 * @params controller{function}
 */

function protectedCommentRoute(route, prop, roles, controller) {
  return commentRouter[prop](route, authenticate, authorize(roles), wrap(controller));
}

//Validate comment
commentRouter.param('commentId', wrap(async (req, res, next) => {
  try {
    let thread = await Thread.findOne({_id: req.params.threadId}).exec();
    let comment = _.find(thread.comments, comment => comment._id.toString() === req.params.commentId.toString());
    if (comment) {
      req.comment = comment;
      return next();
    }
    return res.notFound('Comment is not found');
  } catch (err) {
    return next(err);
  }
}));

protectedCommentRoute('/', 'post', [], comment.create); 
protectedCommentRoute('/:commentId', 'put', ['admin', 'commentOwner'], comment.update);
protectedCommentRoute('/:commentId', 'delete', ['admin', 'commentOwner'], comment.remove);
protectedCommentRoute('/:commentId/like', 'get', undefined, comment.like);

export default router;
