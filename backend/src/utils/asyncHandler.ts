import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async route handler to properly catch rejected promises
 * and forward them to Express error handler instead of crashing the server.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
