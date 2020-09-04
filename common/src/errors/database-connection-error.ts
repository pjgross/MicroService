import { CustomError } from "./custom-error"

export class DatabaseConnectionError extends CustomError {
  // error handlers must have a statusCode property and serializeErrors function
  reason = "error connecting to database"
  statusCode = 500
  constructor() {
    super("Error connecting to auth database")
    // only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors = () => {
    return [{ message: this.reason }]
  }
}
