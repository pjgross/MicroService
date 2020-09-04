import { Request, Response, NextFunction } from "express"
// import error handlers
import { CustomError } from "../errors/custom-error"

// all express middleware with 4 parameteres is an errorhandler
// This will catch all errors that were throw as part of dealig with a request
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check to see whether one of our custom errors was thrown
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() })
  }
  // otherwise throw a generic error
  // make sure we log the error to console
  console.error(err)
  res.status(400).send({
    errors: [{ message: "Unhandled error occurred" }],
  })
}
