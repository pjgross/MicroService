import { Stan } from "node-nats-streaming"
import { Subjects } from "./subjects"

// define a generic event template
interface Event {
  subject: Subjects
  data: any
}

// an abstract publisher to NATS class
export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"]
  protected client: Stan

  constructor(client: Stan) {
    this.client = client
  }

  publish(data: T["data"]): Promise<void> {
    // return a promise so we can await to see whether there was an error
    return new Promise((resolve, reject) => {
      // publish to the subject channel with the data passed in turning it from object to string
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
