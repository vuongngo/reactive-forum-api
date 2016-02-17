export function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
};

export function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.serverError('Something failed!');
  } else {
    next(err);
  }
};

export function serverErrorHandler(err, req, res, next) {
  switch (err.name) {
    case 'ValidationError':
      for (var prop in err.errors) {
        res.serverError(err.errors[prop].message);
      }
      break;
    case 'CastError':
      res.notFound(err.message);
      break;
    case 'Unauthenticated':
      res.unauthorized(err.message);
      break;
    default:
      res.serverError(err);
  }
};
