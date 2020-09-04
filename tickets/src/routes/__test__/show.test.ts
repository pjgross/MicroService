import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"

it("returns a 404 if the ticket is not found", async () => {
  // need to generate a valid mongoose id to avoid mongoose find error
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app).get(`/api/tickets/${id}`).send().expect(404)
})

it("returns the ticket if the ticket is found", async () => {
  const title = "test"
  const price = 20
  // create the ticket
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
  // find the ticket in the database and check no auth works
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)
  // check the field values
  expect(ticketResponse.body.title).toEqual(title)
  expect(ticketResponse.body.price).toEqual(price)
})
