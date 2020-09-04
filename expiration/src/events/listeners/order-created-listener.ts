import { Listener, OrderCreatedEvent, Subjects } from "@msexample/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { expirationQueue } from "../../queues/expiration-queue"

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName
  // define what happens when the listener detects a new order event
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // define the delay that should occur
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log("Waiting this many milliseconds to process the job:", delay)
    // create the bull queue with the orderid and the delay required
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    )
    // tell Nats we have processed this event
    msg.ack()
  }
}
