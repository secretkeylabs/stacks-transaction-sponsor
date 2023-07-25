import { ErrorRequestHandler, RequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 400;
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
  });

  req.logger.error({ err }, 'An error occurred');
  next();
};

export const wrongRouteHandler: RequestHandler = (req, res) => {
  const statusCode = 404;
  const message = 'Route not found';

  req.logger.warn({
    message,
    path: req.path,
    params: req.params,
    headers: req.headers,
    body: req.body,
    ip: req.ip,
  });

  return res.status(statusCode).json({
    status: statusCode,
    message,
  });
};
