import express from "express"

const router = express.Router()

// reset the cookie to signout the user
router.post("/api/users/signout", (req, res) => {
  req.session = null
  res.send({})
})

export { router as signoutRouter }
