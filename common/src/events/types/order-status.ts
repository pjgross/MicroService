export enum OrderStatus {
  // ordered is created, but reservation has not been confirmed
  Created = "created",
  // order created but ticket was already reserved or user cancelled
  // or order expired
  Cancelled = "cancelled",
  // order has been confirmed as reserved but awaiting payment
  AwaitingPayment = "awaiting;payment",
  // order has been paid for
  Complete = "complete",
}
