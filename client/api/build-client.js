import axios from "axios"

// This create an axios client to be called from initprops
// initprops can  occur on the client or server so we have to cater for this
const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server so we have to talk to the load balancer
    // need to check with on the cloud - does not work with minikube
    return axios.create({
      baseURL: process.env.SERVER_URL_BASE,
      headers: req.headers,
    })
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: "/",
    })
  }
}

export default buildClient
