import "bootstrap/dist/css/bootstrap.css"
import buildClient from "../api/build-client"
import Header from "../components/header"

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  )
}

// getInitial props can be called on the server or client
AppComponent.getInitialProps = async (appContext) => {
  // build the axios endpoint which will vary if we are on the client or server
  const client = buildClient(appContext.ctx)
  // call the auth endpoint
  const { data } = await client.get("/api/users/currentuser")
  // call the pages getInitialprops since this is not called if one exists
  // on the _app component
  let pageProps = {}
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    )
  }
  //pass the information onto the AppComponent
  return {
    pageProps,
    ...data,
  }
}

export default AppComponent
