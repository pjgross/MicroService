import { useEffect, useState } from "react"
import StripeCheckout from "react-stripe-checkout"
import Router from "next/router"
import useRequest from "../../hooks/use-request"

const OrderShow = ({ order, currentUser }) => {
  // define the state
  const [timeLeft, setTimeLeft] = useState(0)
  // retrieve the request function and error state
  // pass in the method, url, body and what to do if successful
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  })

  useEffect(() => {
    // calculate the time left function and update state
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }
    // call the time left function
    findTimeLeft()
    // set interval to 1 sec
    const timerId = setInterval(findTimeLeft, 1000)
    // clear the interval if we navigate away from component
    return () => {
      clearInterval(timerId)
    }
  }, [order])
  // if the time left is negative invalidate page
  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }
  // what is displayed on the screen
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_1M3q4BvcBVlMJhEHO0tVOgq0"
        amount={order.ticket.price * 100}
        email={currentUser.email}
        curreny="GBP"
      />
      {errors}
    </div>
  )
}

// define initial data setup for the form
OrderShow.getInitialProps = async (context, client) => {
  // get the order id from the query string
  // the orderId comes from the name of the file
  const { orderId } = context.query
  // retrieve the order from the database using axios client we created
  const { data } = await client.get(`/api/orders/${orderId}`)
  // merge data into page props
  return { order: data }
}

export default OrderShow
