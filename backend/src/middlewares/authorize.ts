import { Request, Response, NextFunction } from 'express'
import { forbidden } from '../utils/apiResponse'

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      forbidden(res)
      return
    }
    next()
  }
}
