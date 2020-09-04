import nats, { Stan } from "node-nats-streaming"

// a wrapper class to connect to nats and be available to our whole application
class NatsWrapper {
  // tell typescript that this may not exist
  private _client?: Stan

  // return the stan object via a getter so its called by stan.client not stan.client()
  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting")
    }
    return this._client
  }
  // connect to nats called once from index.ts
  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url })
    // return a promise so we can await for the connection to succeed
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS")
        resolve()
      })
      this.client.on("error", (err) => {
        reject(err)
      })
    })
  }
}
// export an instance of the wrapper - which will be the same for the whole app
export const natsWrapper = new NatsWrapper()
