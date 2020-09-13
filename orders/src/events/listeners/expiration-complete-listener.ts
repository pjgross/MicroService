import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from "@msexample/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { Order } from "../../models/order"
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher"

// listen for expiring orders
export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  // set the queuegroup name for this process
  queueGroupName = queueGroupName
  // set the subject we are listening on
  readonly subject = Subjects.ExpirationComplete
  // the base listener calls the onMessage function with parsed data and original message
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    // find the otder that expired with the ticket data
    const order = await Order.findById(data.orderId).populate("ticket")
    // check that the order was found
    if (!order) {
      throw new Error("Order not found")
    }
    // if the order has been paid for then tell Nats we have finished processing
    if (order.status === OrderStatus.Complete) {
      return msg.ack()
    }
    // order has not been paid so cancel the order
    order.set({
      status: OrderStatus.Cancelled,
    })
    await order.save()
    // publish that we have cancelled this order
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    })
    // tell Nats we have finished processing
    msg.ack()
  }
}
