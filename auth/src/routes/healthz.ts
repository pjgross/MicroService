import express, { Request, Response } from "express"

const router = express.Router()

router.get("/api/users/healthz", async (req: Request, res: Response) => {
  // send back health check message

  res.status(200).send("I am healthy")
})

export { router as healthzRouter }
