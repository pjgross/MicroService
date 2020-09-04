import nats from "node-nats-streaming"
import { TicketCreatedPublisher } from "./events/ticket-created-publisher"

console.clear()

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
})

stan.on("connect", async () => {
  console.log("Publisher connected to NATS")

  const publisher = new TicketCreatedPublisher(stan)
  // try to publish the event
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    })
  } catch (err) {
    // catch any errors with the publishing event
    console.error(err)
  }
})
