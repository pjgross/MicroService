import { Subjects } from "./subjects"

// ties the TicketCreated event to the data we expect on that event
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated
  data: {
    id: string
    version: number
    title: string
    price: number
    userId: string
    orderId?: string
  }
}
