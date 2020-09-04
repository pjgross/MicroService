// import these to tell typescript about the express types
import { Request, Response, NextFunction } from "express"

import { validationResult } from "express-validator"

import { RequestValidationError } from "../errors/request-validation-error"

// define the express middleware function
// it is a normal function so only has 3 params
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // retrieve the errors from express validator
  const errors = validationResult(req)
  // if the errors arracy is not empty then throw an error
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array())
  }
  // otherwise continue onto the next middleware
  next()
}
