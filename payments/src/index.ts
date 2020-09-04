import mongoose from "mongoose"

import { app } from "./app"
// import NATS libraries
import { natsWrapper } from "./nats-wrapper"
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener"
import { OrderCreatedListener } from "./events/listeners/order-created-listener"

const start = async () => {
  console.log("Starting...")
  // first check that all required environment variables are defined
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined")
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined")
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined")
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined")
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined")
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error("STRIPE_KEY must be defined")
  }
  try {
    // connect to the NATS server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )
    // if the nats wrapper receives a close event close the ticketing system
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed")
      process.exit()
    })
    // if the ticketing service is being closed tell nats
    process.on("SIGINT", () => natsWrapper.client.close())
    process.on("SIGTERM", () => natsWrapper.client.close())
    // start the listeners for messages we are expecting
    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
    // connect to mongodb
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log("Payments Connected to Mongodb and NATS")
  } catch (err) {
    console.error(err)
  }
  //start the service
  app.listen(3000, () => {
    console.log("Payments Listening on port 3000")
  })
}
start()
