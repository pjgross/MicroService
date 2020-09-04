import mongoose from "mongoose"
import { Password } from "../services/password"

// an interface that describes the properties that are required to create a new user
interface UserAttrs {
  email: string
  password: string
}

// an interface that describes the build function for typescript
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// an interface that describes the props that a user document has
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

// defines the mongoDB structure
// change the default json fields returned by redefining toJSON
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

// run before a user is saved
// we use the this keyword so cannt use an arrow function
userSchema.pre("save", async function (done) {
  // if the password was updated then store the hash of it
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"))
    this.set("password", hashed)
  }
  done()
})
// done this way to allow typescript to understand the attributes
// this is because you use User.build() instead of new User
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

// setup the model
const User = mongoose.model<UserDoc, UserModel>("User", userSchema)

export { User }
