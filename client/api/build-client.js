import axios from "axios"

// this can be called from the client or server so we have to
// cater for this by checking whether window has been defined (i.e. client only)
const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server so we have to talk to the load balancer
    // need to check with on the cloud - does not work with minikube
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
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
