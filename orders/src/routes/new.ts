import mongoose from "mongoose"
import express, { Request, Response } from "express"
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@msexample/common"
import { body } from "express-validator"
import { Ticket } from "../models/ticket"
import { Order } from "../models/order"
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()

// set the expiration window
const EXPIRATION_WINDOW_SECONDS = parseInt(
  process.env.EXPIRATION_WINDOW_SECONDS!
)

// make sure the input is a valid mongodb id
// this is assuming the source is mongo which may not be the case
router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved")
    }

    // Calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it to the database reserving the ticket
    // there is a small chance that two requests could get to this point at the same time
    // but for this app its not worth over complicating the solution
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    })
    await order.save()

    // Publish an event saying that an order was created
    // passing expires at in UTC time format string
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    })
    // respond to requestor
    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
