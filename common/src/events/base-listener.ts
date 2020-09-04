import { Message, Stan } from "node-nats-streaming"
import { Subjects } from "./subjects"

// define a generic event template
interface Event {
  subject: Subjects
  data: any
}

// base Listener class
export abstract class Listener<T extends Event> {
  abstract subject: T["subject"]
  abstract queueGroupName: string
  abstract onMessage(data: T["data"], msg: Message): void

  protected client: Stan
  protected ackWait = 5 * 1000

  // pass in the NATS server connection
  constructor(client: Stan) {
    this.client = client
  }
  // setup the subscription options we need
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }
  // define subscription and start listening
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )
    // define what to do when a message is received
    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`)
      // get the data from the message
      const parsedData = this.parseMessage(msg)
      // invoke the passed in action with the data and original message
      this.onMessage(parsedData, msg)
    })
  }
  // define a helper function to parse the message data catering for strings and buffers
  parseMessage(msg: Message) {
    const data = msg.getData()
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"))
  }
}
