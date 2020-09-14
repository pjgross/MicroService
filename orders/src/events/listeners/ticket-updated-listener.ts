import { Message } from "node-nats-streaming"
import { Subjects, Listener, TicketUpdatedEvent } from "@msexample/common"
import { Ticket } from "../../models/ticket"
import { queueGroupName } from "./queue-group-name"

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    // get the previous version of the ticket
    const ticket = await Ticket.findByEvent(data)
    // error if the previous version could not be found
    if (!ticket) {
      throw new Error("Ticket version not found")
    }
    // update the data
    const { title, price } = data
    ticket.set({ title, price })
    // save back to the database
    await ticket.save()
    // log out the action and send response to NATS
    console.log(`Orders just recorded updated ticket ${ticket.title}`)
    msg.ack()
  }
}
