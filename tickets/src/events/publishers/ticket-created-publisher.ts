import { Publisher, Subjects, TicketCreatedEvent } from "@msexample/common"

// extend the base Publisher class and associate with the TicketCreatedEvent definition
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
