import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

// tell typescript that we have defined a new function in global
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
    }
  }
}
jest.mock("../nats-wrapper")
let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = "asdf"

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  // clear the mock function stats
  jest.clearAllMocks()
  // clear the database
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  // close down the database
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = () => {
  // this is how to create a fake cookie outside of the auth service

  // build a jwt payload making sure the id is a valid mongodb id
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  }
  // create the jwt telling typescript to ignore type check
  const token = jwt.sign(payload, process.env.JWT_KEY!)
  // build session object
  const session = { jwt: token }
  // turn that session into json
  const sessionJSON = JSON.stringify(session)
  // take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64")

  // return a string to represent the cookie data, supertest expects cookies in an array
  return [`express:sess=${base64}`]
}
