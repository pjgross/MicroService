import mongoose from "mongoose"
import { updateIfCurrentPlugin } from "mongoose-update-if-current"
// attributes used to create the Ticket
interface TicketAttrs {
  title: string
  price: number
  userId: string
}

// Describes what is stored
interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
  version: number
  orderId?: string
}

// adds the build function to the model
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

//define the document and what json it returns
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)
// set the version key to version instead of __v the default
ticketSchema.set("versionKey", "version")
// start using the mongoose-update-if-current plugin
ticketSchema.plugin(updateIfCurrentPlugin)
// built so typescript knows about the attributes
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema)

export { Ticket }
