import express, { Request, Response } from "express"

const router = express.Router()

router.get("/api/tickets/healthz", async (req: Request, res: Response) => {
  // send back health check message

  res.send("I am healthy")
})

export { router as healthzRouter }
