import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import request from "supertest"

import { app } from "../app"

// need to tell typescript we are adding signin to global
// doing it this way to reduce importing it everywhere it needs to be used
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>
    }
  }
}

// define the mongo variable
let mongo: any
// before all test hook function
beforeAll(async () => {
  // setup environment variable normally setup in the deployment file
  process.env.JWT_KEY = "asdf"
  // start mongo memory server
  mongo = new MongoMemoryServer()
  // get the uri to connect to
  const mongoUri = await mongo.getUri()
  // start mongoose connection
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()
  // reset the data before each test
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

// after all tests have run
afterAll(async () => {
  // stop the connections and memory server
  await mongo.stop()
  await mongoose.connection.close()
})

// need to return a cookie for the tests to work
// done globally for ease of use, could have been developed as an
// exported function which could be imported where its used
global.signin = async () => {
  const email = "test@test.com"
  const password = "password"

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201)
  const cookie = response.get("Set-Cookie")

  return cookie
}
