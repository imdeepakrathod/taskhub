import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

import { AppError } from '../common/errors/AppError.js'

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    })

    return
  }

  console.error('Unhandled application error:', error)

  res.status(500).json({
    status: 'error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
