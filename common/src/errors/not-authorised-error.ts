import { CustomError } from "./custom-error"

export class NotAuthorisedError extends CustomError {
  // error handlers must have a statusCode property and serializeErrors function
  statusCode = 401
  constructor() {
    super("Not Authorised")
    // only because we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorisedError.prototype)
  }

  serializeErrors = () => {
    return [{ message: "Not authorised" }]
  }
}
