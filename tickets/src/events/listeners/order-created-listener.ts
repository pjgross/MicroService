import { Message } from "node-nats-streaming"
import { Listener, OrderCreatedEvent, Subjects } from "@msexample/common"
import { queueGroupName } from "./queue-group-name"
import { Ticket } from "../../models/ticket"
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher"

// extend the base listener class and tie to the subject to data binding
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  // set read only field recording the subject to publish to
  readonly subject = Subjects.OrderCreated
  // set the queue group this service uses in NATS
  queueGroupName = queueGroupName

  // define the function that the listen event invokes
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    // If no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found")
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id })

    // Save the ticket and publish this event to NATS
    await ticket.save()
    // need to publish an update to make sure the version no. is cascaded
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    })

    // tell NATS we have successfully processed the event
    msg.ack()
  }
}
