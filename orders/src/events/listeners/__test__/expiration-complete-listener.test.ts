import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderStatus, ExpirationCompleteEvent } from "@msexample/common"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from "../../../models/order"
import { Ticket } from "../../../models/ticket"

//setup for each test
const setup = async () => {
  // setup the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client)
  // create a new ticket in the database
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  })
  await ticket.save()
  // setup an order in the database
  const order = Order.build({
    status: OrderStatus.Created,
    userId: "alskdfj",
    expiresAt: new Date(),
    ticket,
  })
  await order.save()
  // setup data for the expiration complete event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  }
  // setup the part of the Nats message we use
  // and tell typescript to ignore errors
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  // return the setup variables
  return { listener, order, ticket, data, msg }
}

it("updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup()
  // process the listener event
  await listener.onMessage(data, msg)
  // find the order that should have been updated
  const updatedOrder = await Order.findById(order.id)
  // check the status
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("emit an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)
  // check that our mock function was called
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  // check the data sent to the mock function was correct
  // mock.calls[][] has all of the parameters for each call
  // we have only made 1 call and want to look at [1] parameter so [0][1]
  // the [0] parameter is the subject channel
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(eventData.id).toEqual(order.id)
})

it("ack the message", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
