import { Listener } from "./base-listener"
import { Message } from "node-nats-streaming"
import { TicketCreatedEvent } from "./ticket-created-event"
import { Subjects } from "./subjects"
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // set the type and value to the enum specified in the event
  readonly subject = Subjects.TicketCreated

  queueGroupName = "payments-service"

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data", data)

    // tell NATS we have processed the message
    msg.ack()
  }
}
