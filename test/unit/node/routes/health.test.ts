import * as httpserver from "../../../utils/httpserver"
import * as integration from "../../../utils/integration"

describe("health (http)", () => {
  let codeServer: httpserver.HttpServer | httpserver.HttpsServer | undefined

  afterEach(async () => {
    if (codeServer) {
      await codeServer.dispose()
      codeServer = undefined
    }
  })

  it("/healthz", async () => {
    codeServer = await integration.setup(["--auth=none"], "")
    const resp = await codeServer.fetch("/healthz")
    expect(resp.status).toBe(200)
    const json = await resp.json()
    expect(json).toStrictEqual({ lastHeartbeat: 0, status: "expired" })
  })

  it("/healthz (websocket)", async () => {
    codeServer = await integration.setup(["--auth=none"], "")
    const ws = codeServer.ws("/healthz")
    const message = await new Promise((resolve, reject) => {
      ws.on("error", console.error)
      ws.on("message", (message) => {
        try {
          const j = JSON.parse(message.toString())
          resolve(j)
        } catch (error) {
          reject(error)
        }
      })
      ws.on("open", () => ws.send(JSON.stringify({ event: "health" })))
    })
    ws.terminate()
    expect(message).toStrictEqual({ event: "health", status: "expired", lastHeartbeat: 0 })
  })
})

describe("health (https)", () => {
  let codeServer: httpserver.HttpServer | httpserver.HttpsServer | undefined

  afterEach(async () => {
    if (codeServer) {
      await codeServer.dispose()
      codeServer = undefined
    }
  })

  it("/healthz (websocket) with --cert", async () => {
    // NOTES@jsjoeio
    // We connect to /healthz via a websocket
    // and send a message and then we expect it to work
    // with our HTTPS server
    // and the cert arg passed in as well.
    // Notes from Slack
    // Ahser said "we could connect it to /vscode
    // Add the appropriate query variables (it expects connectionType and some other things, probably easiest to look at the browser and see)
    // Then it might be enough to just see if that connection errors or not
    // If it does not error then you probably have to try actually sending some data on it"
    // Not sure what do do there. Guess I need to spin up code-server
    // and look at the network tab.
    // Also confused on the /healthz vs /vscode part
    // The websocket runs on /healthz. Is that it?
    codeServer = await integration.setup(["--auth=none", "--cert"], "")
    const ws = codeServer.ws("/healthz")
    const message = await new Promise((resolve, reject) => {
      ws.on("error", console.error)
      ws.on("message", (message) => {
        try {
          const j = JSON.parse(message.toString())
          resolve(j)
        } catch (error) {
          reject(error)
        }
      })
      ws.on("open", () => ws.send(JSON.stringify({ event: "health" })))
    })
    ws.terminate()
    expect(message).toStrictEqual({ event: "health", status: "expired", lastHeartbeat: 0 })
  })
})
