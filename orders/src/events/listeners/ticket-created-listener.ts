import { Message } from "node-nats-streaming"
import { Subjects, Listener, TicketCreatedEvent } from "@msexample/common"
import { Ticket } from "../../models/ticket"
import { queueGroupName } from "./queue-group-name"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // set the subject we are listening on
  readonly subject = Subjects.TicketCreated
  // set the queuegroup name for this process
  queueGroupName = queueGroupName
  // the base listener calls the onMessage function with parsed data and original message
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // get the data from the parsed data field
    const { id, title, price } = data
    // create a ticket record
    const ticket = Ticket.build({
      id,
      title,
      price,
    })
    await ticket.save()
    // record the event to the console
    console.log(`Orders just recorded new ticket ${ticket.title}`)
    // tell NATS that the message has been processed
    msg.ack()
  }
}
