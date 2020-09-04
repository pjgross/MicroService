// define what to do when the bull delay has expired
import { Subjects, Publisher, ExpirationCompleteEvent } from "@msexample/common"

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete
}
