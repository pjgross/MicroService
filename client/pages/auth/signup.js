import { useState, useEffect } from "react"
import { useRouter } from "next/router"

// import the hook for calling end points
import useRequest from "../../hooks/use-request"

const signUp = () => {
  const router = useRouter()
  // define the state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // retrieve the request function and error state
  // pass in the method, url, body and what to do if successful
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => router.push("/"),
  })

  // define the submit function
  const onSubmit = async (event) => {
    event.preventDefault()
    // call the function returned by the useRequest hook
    await doRequest()
  }

  // define the output
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  )
}

export default signUp
