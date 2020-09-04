import { Listener, OrderCancelledEvent, Subjects } from "@msexample/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { Ticket } from "../../models/ticket"
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher"

// extend the base listener class and tie to the subject to data binding
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  // set read only field recording the subject to publish to
  readonly subject = Subjects.OrderCancelled
  // set the queue group this service uses in NATS
  queueGroupName = queueGroupName

  // define the function that the listen event invokes
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)
    // If no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found")
    }
    // unset the orderid to cancel the reservation
    ticket.set({ orderId: undefined })
    // save the ticket and publish this event to NATS
    await ticket.save()
    // need to publish an update to make sure the version no. is cascaded
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    })
    // tell NATS we have successfully processed the event
    msg.ack()
  }
}
