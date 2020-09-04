import { natsWrapper } from "./nats-wrapper"
import { OrderCreatedListener } from "./events/listeners/order-created-listener"

const start = async () => {
  // first check that all required environment variables are defined
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined")
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined")
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined")
  }
  // connect to nats
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
    // start listening for order creations
    new OrderCreatedListener(natsWrapper.client).listen()
  } catch (err) {
    console.error(err)
  }
}
start()
