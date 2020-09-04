import axios from "axios"
import { useState } from "react"

const useRequest = ({ url, method, body, onSuccess }) => {
  // define the errors state that is returned
  const [errors, setErrors] = useState(null)
  // define the function definition that is returned
  const doRequest = async (props = {}) => {
    try {
      // reset the errors on each new call
      setErrors(null)
      // make the call
      const response = await axios[method](url, { ...body, ...props })
      // if there was a callback then call it
      // we do it here because the calling program does not get any errors since we catch them
      if (onSuccess) {
        onSuccess(response.data)
      }
      // return the fetch data
      return response.data
    } catch (err) {
      // if there was an error then set the error state
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      )
    }
  }
  // return the request function and error state
  return { doRequest, errors }
}

export default useRequest
