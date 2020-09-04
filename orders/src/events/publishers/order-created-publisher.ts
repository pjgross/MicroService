import { Publisher, OrderCreatedEvent, Subjects } from "@msexample/common"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
