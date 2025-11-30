
import { logger } from "../config/logger.js";

export const loggerMiddleware = (req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
};
