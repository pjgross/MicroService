import express from "express"
// import a library which allows us to throw errors in async route handlers
import "express-async-errors"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import swStats from "swagger-stats"

// import the express route handlers
import { createTicketRouter } from "./routes/new"
import { showTicketRouter } from "./routes/show"
import { indexTicketRouter } from "./routes/index"
import { updateTicketRouter } from "./routes/update"
import { healthzRouter } from "./routes/healthz"
// import the express error middleware
import { errorHandler, NotFoundError, currentUser } from "@msexample/common"

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
// /api/tickets/ui  for the swagger stats ui
// /api/tickets/metrics for the prometheus endpoint
app.use(
  swStats.getMiddleware({
    uriPath: "/api/tickets",
  })
)
// get the current user for every request if signed in
app.use(currentUser)
// routes for the service
app.use(createTicketRouter)
app.use(healthzRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

// handle routes we were not expectinng
app.all("*", async () => {
  throw new NotFoundError()
})
// handle any thrown errors
app.use(errorHandler)

export { app }
