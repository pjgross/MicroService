import { Subjects } from "./subjects"

// ties the TicketCreated event to the data we expect on that event
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated
  data: {
    id: string
    title: string
    price: number
  }
}
