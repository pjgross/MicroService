import request from "supertest"
import { app } from "../../app"

// creates a ticket
const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "title",
    price: 10,
  })
}

it("can fetch a list of tickets", async () => {
  // create three tickets
  await createTicket()
  await createTicket()
  await createTicket()
  // retrieve all tickets
  const ticketResponse = await request(app)
    .get(`/api/tickets`)
    .send()
    .expect(200)
  // expect body to contain an array of three elements
  expect(ticketResponse.body.length).toEqual(3)
})
