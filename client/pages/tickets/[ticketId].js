import Router from "next/router"
// import the hook for calling end points
import useRequest from "../../hooks/use-request"

const TicketShow = ({ ticket }) => {
  // retrieve the request function and error state
  // pass in the method, url, body and what to do if successful
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    // navigate to the new order page if successful
    // in nextjs we have to supply file and url to navigate
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  })
  // what is displayed on the screen
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  )
}
// define initial data setup for the form
TicketShow.getInitialProps = async (context, client) => {
  // get the ticket id from the query string
  // the ticketId comes from the name of the file
  const { ticketId } = context.query
  // retrieve the ticket from the database
  const { data } = await client.get(`/api/tickets/${ticketId}`)
  // merge data into page props
  return { ticket: data }
}

export default TicketShow
