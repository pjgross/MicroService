import { Publisher, Subjects, TicketUpdatedEvent } from "@msexample/common"

// extend the base Publisher class and associate with the TicketUpdatedEvent definition
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
