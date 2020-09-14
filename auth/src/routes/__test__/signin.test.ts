import request from "supertest"
import { app } from "../../app"

it("returns a 200 on successful signin", async () => {
  // need to create the user first
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
  // now try and sign in
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200)
})

it("returns a 400 on unsuccessful signin", async () => {
  // create a user
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
  // try and  sigin with an incorrect password
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "passwor",
    })
    .expect(400)
})

it("returns a 400 on unsuccessful signin", async () => {
  // try and  signin without having created a user
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "passwor",
    })
    .expect(400)
})

it("sets a cookie after successful signin", async () => {
  // create a user
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
  // sigin with the user
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200)
  // check the response has a cookie defined
  expect(response.get("Set-Cookie")).toBeDefined()
})
