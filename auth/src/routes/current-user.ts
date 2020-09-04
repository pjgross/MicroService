import express from "express"

import { currentUser } from "@msexample/common"

const router = express.Router()

// use the currentUser middleware to get the current user and return it
router.get("/api/users/currentuser", currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
