import mongoose from "mongoose"

import { app } from "./app"
import { natsWrapper } from "./nats-wrapper"
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener"
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener"
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener"
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener"

const start = async () => {
  console.log("Starting.......")
  // first check that all required environment variables are defined
  if (!process.env.EXPIRATION_WINDOW_SECONDS) {
    throw new Error("EXPIRATION_WINDOW_SECONDS must be defined")
  }
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
  // connect to mongodb
  try {
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
    // now start the NATs listeners
    new TicketCreatedListener(natsWrapper.client).listen()
    new TicketUpdatedListener(natsWrapper.client).listen()
    new ExpirationCompleteListener(natsWrapper.client).listen()
    new PaymentCreatedListener(natsWrapper.client).listen()
    // connect to mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log("Connected to mongodb")
  } catch (err) {
    console.error(err)
  }
  //start the service
  app.listen(3000, () => {
    console.log("Listening on port 3000 :)")
  })
}
start()
