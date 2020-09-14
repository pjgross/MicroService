import request from "supertest"
import { app } from "../../app"

it("responds with details of the signed in user", async () => {
  // need to get a cookie to send with the request
  const cookie = await global.signin()
  // make a call to the currentuser endpoint
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200)
  // expect the user created in the setup.ts
  expect(response.body.currentUser.email).toEqual("test@test.com")
})

it("responds with null if not authenticated", async () => {
  // this time call without a user cookie
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200)
  expect(response.body.currentUser).toEqual(null)
})
