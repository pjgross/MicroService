// this middleware will extract the current user info into the request
// details avaiable on req.currentUser
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// tells typescript the details in the jwt token
interface UserPayload {
  id: string
  email: string
}
// tells typescript we are adding a variable to the Express Request object type
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

// define the express middleware
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // the ? makes sure req.session is defined
  // if no session goto next middleware function
  if (!req.session?.jwt) {
    return next()
  }
  // get details from jwt token telling typescript the format to expect
  // ignore errors so it just continues to next function
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload
    req.currentUser = payload
  } catch (err) {}
  // continue to next middleware
  next()
}
