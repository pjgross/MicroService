import express, { Request, Response } from "express"
import {
  requireAuth,
  NotFoundError,
  NotAuthorisedError,
} from "@msexample/common"
import { Order } from "../models/order"

const router = express.Router()

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket")
    // check that an order was found
    if (!order) {
      throw new NotFoundError()
    }
    // make sure the currentUser owns the order
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError()
    }
    // return the order
    res.send(order)
  }
)

export { router as showOrderRouter }
