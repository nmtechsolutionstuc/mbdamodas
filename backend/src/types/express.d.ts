import { AccessTokenPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface User extends AccessTokenPayload {}
  }
}
