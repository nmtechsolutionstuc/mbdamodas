/* eslint-disable @typescript-eslint/no-unused-vars */
import { AccessTokenPayload } from '../utils/jwt'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload
  }
}
