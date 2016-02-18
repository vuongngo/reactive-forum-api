export default function authorize(roles, obj) {
  return (req, res, next) => {
    if ( isAdmin(roles, req) ) {
      return next(); 
    }
    if (obj) {
      if ( isOwner(roles, req, obj) ) {
        return next();
      };
    }
    if ( isSelf(roles, req) ) {
      return next();
    };
    res.unauthorized('Sorry, this resouce is protected');
  }
}

function isAdmin(roles, req) {
  if (roles.indexOf('admin') > -1 && req.user.userrole === 'admin') {
    return true;
  }
  return false;
}

function isOwner(roles, req, obj) {
  if (roles.indexOf('owner') > -1 && obj.findOne({_id: req.params.id}).populate('user').owner._id === req.user._id) {
    return true;
  }
  return false;
}

function isSelf(roles, req) {
  if (roles.indexOf('self') > -1 && req.params.userId.toString() === req.user._id.toString()) {
    return true;
  }
  return false;
}
