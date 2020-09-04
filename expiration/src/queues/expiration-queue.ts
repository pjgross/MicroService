// define the bull queue process the listener invokes
import Queue from "bull"
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher"
import { natsWrapper } from "../nats-wrapper"

// define the information we are sending to the queue
interface Payload {
  orderId: string
}
// setup a bull queue with name 'order:expiration', telling it the location of redis
const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
})
// define what happens when the job is processed
expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  })
})

export { expirationQueue }
