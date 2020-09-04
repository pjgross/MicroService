import { Message } from "node-nats-streaming"
import mongoose from "mongoose"
import { OrderCreatedEvent, OrderStatus } from "@msexample/common"
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()

  // Create the fake data event
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "alskdjf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it("sets the userId of the ticket", async () => {
  // setup the default data
  const { listener, ticket, data, msg } = await setup()
  // call the function to process the event
  await listener.onMessage(data, msg)
  // find the updated ticket
  const updatedTicket = await Ticket.findById(ticket.id)
  // check the update that should have been made
  expect(updatedTicket!.orderId).toEqual(data.id)
})

it("acks the message", async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup()
  // call the listener function
  await listener.onMessage(data, msg)
  // expect our mock function to have been called
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  // natsWrapper.client.publish.mock.calls
  // contains details on the call to the mock
  const ticketUpdatedData = JSON.parse(
    // the jest.Mock is for typescript
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )

  expect(data.id).toEqual(ticketUpdatedData.orderId)
})
