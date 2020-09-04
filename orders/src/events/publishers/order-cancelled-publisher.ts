import { Subjects, Publisher, OrderCancelledEvent } from "@msexample/common"

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
