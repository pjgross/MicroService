import request from "supertest"
import mongoose from "mongoose"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"
import { natsWrapper } from "../../nats-wrapper"

it("returns an error if the ticket does not exist", async () => {
  // make sure the id is a valid id to pass validation
  const ticketId = mongoose.Types.ObjectId()
  // request ticket that does not exist
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId,
    })
    .expect(404)
})

it("returns an error if the ticket already exists", async () => {
  // setup the ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  })
  await ticket.save()
  // setup the order against the ticket
  const order = Order.build({
    userId: "hhgjhgjjff",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  })
  await order.save()
  // try to create an order against ticket that already has an order
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket._id,
    })
    .expect(400)
})

it("reserves a ticket", async () => {
  // build a ticket to create an order on
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  })
  await ticket.save()
  // create an order on the ticket
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket._id,
    })
    .expect(201)
})

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  })
  await ticket.save()

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
