import { Subjects } from "./subjects"

// ties the TicketUpdated event to the data we expect on that event
export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated
  data: {
    id: string
    version: number
    title: string
    price: number
    userId: string
    orderId?: string
  }
}
