import mongoose from "mongoose"

import { app } from "./app"

const start = async () => {
  // first check that all required environment variables are defined
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined")
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined")
  }
  // connect to mongodb
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log("Auth Connected to mongodb")
  } catch (err) {
    console.error(err)
  }
  //start the service
  app.listen(3000, () => {
    console.log("Auth Listening on port 3000")
  })
}
start()
