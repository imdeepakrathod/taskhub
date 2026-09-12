import type { RequestHandler } from 'express'
import { z } from 'zod'

import { BadRequestError } from '../common/errors/httpErrors.js'

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      next(
        new BadRequestError(
          'Request validation failed',
          'VALIDATION_ERROR',
          z.flattenError(result.error),
        ),
      )

      return
    }

    req.body = result.data
    next()
  }
}
