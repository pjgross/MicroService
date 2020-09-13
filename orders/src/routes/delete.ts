import express, { Request, Response } from "express"
import {
  requireAuth,
  NotFoundError,
  NotAuthorisedError,
} from "@msexample/common"
import { Order, OrderStatus } from "../models/order"
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()
// delete order route
router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    // get the orderid sent in on the param
    const { orderId } = req.params
    // get the order from he database icluding the ticket info
    const order = await Order.findById(orderId).populate("ticket")
    // if the order could ot be foud the throw an error
    if (!order) {
      throw new NotFoundError()
    }
    // if not the current user then error
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError()
    }
    // update the order
    order.status = OrderStatus.Cancelled
    await order.save()

    // publishing an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    })

    res.status(204).send(order)
  }
)

export { router as deleteOrderRouter }
