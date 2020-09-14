import request from "supertest"
import { app } from "../../app"

it("returns a 201 on successful signup", async () => {
  // create a user
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
})

it("returns a 400 on invalid email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400)
})

it("returns a 400 on invalid password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "pas",
    })
    .expect(400)
})

it("returns a 400 on missing email and password", async () => {
  return request(app).post("/api/users/signup").send({}).expect(400)
})

it("returns a 400 on missing parameters", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      password: "pas",
    })
    .expect(400)
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("does not allow to signup with existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400)
})
// supertest uses http hence change to cookie setup in app.ts for testing
// otherwise no cookie would be set
it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)

  expect(response.get("Set-Cookie")).toBeDefined()
})
