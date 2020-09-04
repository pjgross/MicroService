import express, { Request, Response } from "express"
import { body } from "express-validator"
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher"
import { natsWrapper } from "../nats-wrapper"
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorisedError,
  BadRequestError,
} from "@msexample/common"
import { Ticket } from "../models/ticket"

const router = express.Router()

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than zero"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)
    // check that we found the record
    if (!ticket) {
      throw new NotFoundError()
    }
    // check to see whether the ticket has been reserved
    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket")
    }
    // check that the record belongs to this user
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError()
    }
    const { title, price } = req.body

    // use set to change the fields
    ticket.set({ title, price })
    // save back to database
    await ticket.save()
    // emit event with the update details
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    })
    // respond to requestor
    res.status(200).send(ticket)
  }
)

export { router as updateTicketRouter }
