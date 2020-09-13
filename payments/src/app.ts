import express from "express"
// import a library which allows us to throw errors in async route handlers
import "express-async-errors"
import { json } from "body-parser"
import cookieSession from "cookie-session"

// import the express route handlers

// import the express error middleware
import { errorHandler, NotFoundError, currentUser } from "@msexample/common"
import { createChargeRouter } from "./routes/new"
import { healthzRouter } from "./routes/healthz"
// had to add this because i ran out of listeners on my mac
require("events").EventEmitter.defaultMaxListeners = 25

// setup the express app which we will export
const app = express()
app.set("trust proxy", true) // ingress service acts as a proxy so add this so express works

app.use(json())
// setup the cookies securing when not in test
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== "test",
  })
)
// get the current user for every request if signed in
app.use(currentUser)
// routes for the service
app.use(createChargeRouter)
app.use(healthzRouter)
// handle routes we were not expectinng
app.all("*", async () => {
  throw new NotFoundError()
})
// handle any thrown errors
app.use(errorHandler)

export { app }
