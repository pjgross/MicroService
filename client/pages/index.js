import Link from "next/link"

const LandingPage = ({ currentUser, tickets }) => {
  // function to display all of the tickets in the table
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    )
  })

  // define what to display on the screen
  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
}

// initialise the data for the form
LandingPage.getInitialProps = async (context, client, currentUser) => {
  // retrieve all tickets in the database
  const { data } = await client.get("/api/tickets")
  // return the tickets to the component this is merged with the page props
  return { tickets: data }
}

export default LandingPage
