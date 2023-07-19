import { RequestHandler } from "express";
import pino, { Logger } from "pino";
import config from "../config/config";

let requestId = 0;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // We extend the Express Request interface here to add custom properties which we'll inject with middleware
    interface Request {
      logger: Logger;
    }
  }
}

/**
 * Use this for logging anything not in a request context, otherwise, use req.logger
 */
export const logger = pino({
  enabled: process.env.NODE_ENV !== "test",
  level: config.logLevel,
  transport: {
    target: "pino-pretty",
  },
});

export const requestLogMiddleware: RequestHandler = (req, res, next) => {
  const requestLogger = logger.child({
    requestId: requestId++,
  });

  req.logger = requestLogger;

  try {
    const onResponseComplete = () => {
      res.removeListener("close", onResponseComplete);
      res.removeListener("finish", onResponseComplete);
      res.removeListener("error", onResponseComplete);

      const logMethod = res.statusCode >= 400 ? "warn" : "info";

      req.logger[logMethod](
        {
          statusCode: res.statusCode,
          host: req.hostname,
          path: req.path,
          method: req.method,
        },
        "request completed"
      );
    };

    res.on("close", onResponseComplete);
    res.on("finish", onResponseComplete);
    res.on("error", onResponseComplete);

    requestLogger.info(
      { host: req.hostname, path: req.path, method: req.method },
      "request started"
    );
    next();
  } catch (err) {
    requestLogger.error({ err }, "error in request log middleware");
    next(err);
  }
};
