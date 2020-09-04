import nats from "node-nats-streaming"
import { randomBytes } from "crypto"
import { TicketCreatedListener } from "./events/ticket-created-listener"

console.clear()
// connect to the nats server <name>, <Clientid>, <connection string>
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
})

// once we receive the connect event
stan.on("connect", () => {
  console.log("Listener connected to NATS")
  // tell the server we are closing so it does not wait for us
  stan.on("close", () => {
    console.log("NATS connection closed")
    process.exit()
  })

  new TicketCreatedListener(stan).listen()
})
// close stan connection when a shutdown event is detected
process.on("SIGINT", () => stan.close())
process.on("SIGTERM", () => stan.close())
