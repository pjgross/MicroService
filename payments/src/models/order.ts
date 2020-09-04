import mongoose from "mongoose"
import { updateIfCurrentPlugin } from "mongoose-update-if-current"
import { OrderStatus } from "@msexample/common"

// the attributes to setup the data
interface OrderAttrs {
  id: string
  version: number
  userId: string
  status: OrderStatus
  price: number
}
// the attributes on the stored document
// remember to add version since the default is __v
interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  price: number
  version: number
}
// add the build function to schema definition for typescript
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}
// define the schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    price: {
      type: Number,
      required: true,
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
orderSchema.set("versionKey", "version")
// start using the mongoose-update-if-current plugin to autoincrement the version no's
orderSchema.plugin(updateIfCurrentPlugin)
// the function to build a new order
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    status: attrs.status,
    userId: attrs.userId,
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema)

export { Order }
