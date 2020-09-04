import { Request, Response, NextFunction } from "express"

import { NotAuthorisedError } from "../errors/not-authorised-error"

// check that the currentUser exits if not throw error
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // current-user needs to have been called first
  if (!req.currentUser) {
    throw new NotAuthorisedError()
  }
  // otherwise continue onto the next middleware
  next()
}
