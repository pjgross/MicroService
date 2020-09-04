import express, { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@msexample/common"

const router = express.Router()

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  // get the id off the parameter
  const ticket = await Ticket.findById(req.params.id)
  // if no record found throw an error
  if (!ticket) {
    throw new NotFoundError()
  }
  // return the ticket to the requestor
  res.status(200).send(ticket)
})

export { router as showTicketRouter }
