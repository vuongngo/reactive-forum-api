export function logErrors(err, req, res, next) {
//  console.error(err.stack);
  return next(err);
};

export function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    return res.serverError('Something failed!');
  } else {
    return next(err);
  }
};

export function serverErrorHandler(err, req, res, next) {
  switch (err.name) {
    case 'ValidationError':
      for (var prop in err.errors) {
        return res.serverError(err.errors[prop].message);
      }
      break;
    case 'CastError':
      return res.notFound(err.message);
      break;
    case 'Unauthenticated':
      return res.unauthorized(err.message);
      break;
    case 'JsonWebTokenError':
      return res.unauthorized(err.message);
      break;
    case 'AuthError':
      return res.unauthorized(err.message);
      break;
    default:
      return res.serverError(err);
  }
};
