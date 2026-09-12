import type { NextFunction, Request, RequestHandler, Response } from 'express'

export function asyncHandler<P = Record<string, string>, ResBody = unknown, ReqBody = unknown>(
  handler: (
    req: Request<P, ResBody, ReqBody>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler<P, ResBody, ReqBody> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
