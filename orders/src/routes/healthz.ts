import express, { Request, Response } from "express"

const router = express.Router()
// get the orders for the current user
router.get("/api/orders/healthz", async (req: Request, res: Response) => {
  // send back health check message

  res.send("I am healthy")
})

export { router as healthzRouter }
