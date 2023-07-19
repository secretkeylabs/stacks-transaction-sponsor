import { ErrorRequestHandler, RequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
  err.statusCode = err.statusCode || 400;
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
  });

  req.logger.error({ err }, 'an error occurred');
};

export const wrongRouteHandler: RequestHandler = (req, res) => {
  const statusCode = 404;
  const message = 'Route not found. Request failed with status code 404';
  res.status(statusCode).json({
    status: statusCode,
    message,
  });
  req.logger.info({
    message,
    path: req.path,
    params: req.params,
    headers: req.headers,
    body: req.body,
    ip: req.ip,
  });
};
