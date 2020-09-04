import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { natsWrapper } from "../../nats-wrapper"
import { Ticket } from "../../models/ticket"

it("returns 404 if the provided id does not exist", async () => {
  // generate a valid mongodb id
  const id = new mongoose.Types.ObjectId().toHexString()
  // send a request to get the non existent id with a cookie
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
    .expect(404)
})

it("returns 401 if the user is not authenticated", async () => {
  //  generate a valid mongodb id
  const id = new mongoose.Types.ObjectId().toHexString()
  // send a request without a cookie so not signed in
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "title",
      price: 10,
    })
    .expect(401)
})

it("returns 401 if the user does not own the ticket", async () => {
  // create a ticket with a new user
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
  // calling signin again will create a new user
  // so updating should fail because of a different user
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "title2",
      price: 20,
    })
    .expect(401)
})

it("returns 400 if the user provides invalid inputs", async () => {
  // create a common signin cookie
  const cookie = global.signin()
  // create a ticket
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 10,
    })
  // try and update without a title
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 10,
    })
    .expect(400)
  // try and update with invalid price
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: -20,
    })
    .expect(400)
})

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 10,
    })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "updated title",
      price: 20,
    })
    .expect(200)
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

  expect(ticketResponse.body.title).toEqual("updated title")
  expect(ticketResponse.body.price).toEqual(20)
})

it("publishes an event", async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 10,
    })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "updated title",
      price: 20,
    })
    .expect(200)
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})
it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asldkfj",
      price: 20,
    })

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(400)
})
