import express from "express"
// import a library which allows us to throw errors in async route handlers
import "express-async-errors"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import swStats from "swagger-stats"

// import the express route handlers
import { currentUserRouter } from "./routes/current-user"
import { signinRouter } from "./routes/signin"
import { signoutRouter } from "./routes/signout"
import { signupRouter } from "./routes/signup"
import { healthzRouter } from "./routes/healthz"
// import the express error middleware
import { errorHandler, NotFoundError } from "@msexample/common"

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
// add the swagger and prometheus metrics
// /api/users/ui  for the swagger stats ui
// /api/users/metrics for the prometheus endpoint
app.use(
  swStats.getMiddleware({
    uriPath: "/api/users",
  })
)
// routes for the service
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(healthzRouter)
// handle routes we were not expectinng
app.all("*", async () => {
  throw new NotFoundError()
})
// handle any thrown errors
app.use(errorHandler)

export { app }
