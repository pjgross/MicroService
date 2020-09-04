import express, { Request, Response } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"

import { Password } from "../services/password"
import { User } from "../models/user"
// import error handlers
import { BadRequestError, validateRequest } from "@msexample/common"

const router = express.Router()

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must enter a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // pull the validated email and password fields from the request body
    const { email, password } = req.body
    //check whether the user already exists
    const existingUser = await User.findOne({
      email,
    })
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials")
    }
    // check the password matches
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    )
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials")
    }
    // generate jwt
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    )
    // store on session object
    req.session = { jwt: userJwt }

    res.status(200).send(existingUser)
  }
)

export { router as signinRouter }
