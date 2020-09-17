import express from "express"
// import a library which allows us to throw errors in async route handlers
import "express-async-errors"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import swStats from "swagger-stats"

import { errorHandler, NotFoundError, currentUser } from "@msexample/common"
import { newOrderRouter } from "./routes/new"
import { showOrderRouter } from "./routes/show"
import { indexOrderRouter } from "./routes/index"
import { deleteOrderRouter } from "./routes/delete"
import { healthzRouter } from "./routes/healthz"
require("events").EventEmitter.defaultMaxListeners = 25

const app = express()
app.set("trust proxy", true) // ingress service acts as a proxy so add this so express works

app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== "test",
  })
)
// add the swagger and prometheus metrics
// /api/orders/ui  for the swagger stats ui
// /api/orders/metrics for the prometheus endpoint
app.use(
  swStats.getMiddleware({
    uriPath: "/api/orders",
  })
)
// attach the current user to the request body on all calls
app.use(currentUser)
// routes for the service
app.use(newOrderRouter)
app.use(healthzRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(deleteOrderRouter)
// handle routes we were not expectinng
app.all("*", async () => {
  throw new NotFoundError()
})
// handle any thrown errors
app.use(errorHandler)

export { app }
