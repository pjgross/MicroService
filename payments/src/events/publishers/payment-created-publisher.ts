import { Subjects, Publisher, PaymentCreatedEvent } from "@msexample/common"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
