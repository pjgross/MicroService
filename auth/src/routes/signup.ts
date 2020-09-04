import express, { Request, Response } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"

// import data models
import { User } from "../models/user"

// import error handlers
import { BadRequestError, validateRequest } from "@msexample/common"

// setup the express router we are configuring
const router = express.Router()

// what to do when we receive traffic on /api/users/signup
// using the body middleware function to validate input fields
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 ans 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // pull the email and password fields from the request body
    const { email, password } = req.body

    //check whether the user already exists
    const existingUser = await User.findOne({
      email,
    })
    if (existingUser) {
      console.log("Email in use")
      throw new BadRequestError("Email in Use")
    }
    // build a new user object
    const user = User.build({
      email,
      password,
    })
    await user.save()

    // generate jwt and tell typescript to ignore JWT_KEY type error
    // since we check it exists in app startup
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    )
    // store on session object
    req.session = { jwt: userJwt }
    // reply to requestor
    res.status(201).send(user)
  }
)

// export the router so the express app can use it
export { router as signupRouter }
