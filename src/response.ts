export function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 400;
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
  });
}

export function wrongRouteHandler(req, res, next) {
  const statusCode = 404;
  res.status(statusCode).json({
    status: statusCode,
    message: 'Route not found. Request failed with status code 404 ',
  });
}
