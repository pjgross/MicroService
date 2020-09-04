// mocked natsWrapper object return
export const natsWrapper = {
  // we just need the client attribute available
  // define as a mock function with jest.fn() and then give a mocked implementation
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback()
        }
      ),
  },
}
