/*
* Strategy to check role
*/
export default function authorize(roles = []) {
  return function (req, res, next) {
    if (roles.length < 1) {
      return next(); 
    }
    let checkRole = (role) => {
      switch(role) {
        case 'admin':
          return isAdmin(req);
          break;
        case 'self':
          return isSelf(req);
          break;
        case 'owner':
          return isOwner(req);
          break;
        case 'commentOwner':
          return isCommentOwner(req);
          break;
        default:
          return false;
      }
    }
    
    if (roles.map(role => checkRole(role)).reduce((prev, current) => prev || current)) {
      return next();
    }
    return res.unauthorized('User is not authorized'); 
  }
}

function isAdmin(req) {
  return req.user.userrole === 'admin';
}

function isSelf(req) {
  return req.params.userId.toString() === req.user._id.toString();
}

function isOwner(req) {
  return req.user._id.toString() === req.obj._user.toString();
}

function isCommentOwner(req) {
  return req.user._id.toString() === req.comment._user.toString();
}

