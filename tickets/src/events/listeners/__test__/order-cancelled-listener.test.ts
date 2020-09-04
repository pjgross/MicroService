import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCancelledEvent } from "@msexample/common"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = mongoose.Types.ObjectId().toHexString()
  // build the test ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString(),
  })
  // set the orderid on the ticket
  ticket.set({ orderId })
  // save the ticket to the database
  await ticket.save()
  // set the data for the publish event
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }
  // set the function we require on the msg variable
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  // return the data to the test
  return { msg, data, ticket, orderId, listener }
}

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { msg, data, ticket, listener } = await setup()
  // call the listeners function that gets invoked
  await listener.onMessage(data, msg)
  // find the ticket that should have been cancelled
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).not.toBeDefined()
  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
