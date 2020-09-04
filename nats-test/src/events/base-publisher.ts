import { Stan } from "node-nats-streaming"
import { Subjects } from "./subjects"

// define a generic event template
interface Event {
  subject: Subjects
  data: any
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"]
  private client: Stan

  constructor(client: Stan) {
    this.client = client
  }

  publish(data: T["data"]): Promise<void> {
    // return a promise so we can wait to see whether there was an error
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        // check whether publish returned an error or not
        if (err) {
          return reject(err)
        }
        console.log("Event published to subject", this.subject)
        // Nats published worked so we can return control to caller
        resolve()
      })
    })
  }
}
