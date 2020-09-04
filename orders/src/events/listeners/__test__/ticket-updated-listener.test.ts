import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { TicketUpdatedEvent } from "@msexample/common"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  })
  await ticket.save()

  // Create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 999,
    userId: "ablskdjf",
  }

  // Create a fake msg object with just the function we need
  // tell typescript to ignore type checking on this
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  // return all of this stuff the tests need
  return { msg, data, ticket, listener }
}

it("finds, updates, and saves a ticket", async () => {
  // get the setup info we need to run the test
  const { msg, data, ticket, listener } = await setup()
  // call the listener onMessage to simulate receiving an event
  await listener.onMessage(data, msg)
  // check our listener created an updated ticket
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it("acks the message", async () => {
  // get the setup info we need to run the test
  const { msg, data, listener } = await setup()
  // call the listener onMessage to simulate receiving an event
  await listener.onMessage(data, msg)
  // check that the ack jest function was called
  expect(msg.ack).toHaveBeenCalled()
})

it("does not call ack if the event has a skipped version number", async () => {
  // get the setup info we need to run the test
  const { msg, data, listener } = await setup()
  // override the version number with an incorrect one
  data.version = 10
  // call the listener onMessage to simulate receiving an event with wrong version
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}
  // check that we did not acknowledge to NATS that we have propcessed the event
  expect(msg.ack).not.toHaveBeenCalled()
})
