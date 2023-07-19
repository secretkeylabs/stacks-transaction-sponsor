import { ErrorRequestHandler, RequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
  err.statusCode = err.statusCode || 400;
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
  });

export const wrongRouteHandler: RequestHandler = (req, res) => {
  const statusCode = 404;
  res.status(statusCode).json({
    status: statusCode,
    message: 'Route not found. Request failed with status code 404 ',
  });
}
