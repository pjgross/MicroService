import request from "supertest"
import { app } from "../../app"

it("returns a 200 on successful signout", async () => {
  // create a user
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
  // call signout
  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200)
  // check the Set-Cookie header equals the expected value
  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  )
})
