import { useState } from "react"
import Router from "next/router"
// import the hook for calling end points
import useRequest from "../../hooks/use-request"

const NewTicket = () => {
  // define the state
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  // retrieve the request function and error state
  // pass in the method, url, body and what to do if successful
  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  })
  // define what to do when form is submitted
  const onSubmit = (event) => {
    event.preventDefault()

    doRequest()
  }
  // triggered when user leaves a control in this case price
  const onBlur = () => {
    const value = parseFloat(price)
    // check to see if not a number
    if (isNaN(value)) {
      return
    }
    // otherwise round to 2 decimal places
    setPrice(value.toFixed(2))
  }
  // what is displayed on the screen
  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default NewTicket
