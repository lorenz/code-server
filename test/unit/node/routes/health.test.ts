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

describe.only("/ with https server", () => {
  let codeServer: httpserver.HttpServer | httpserver.HttpsServer | undefined

  afterEach(async () => {
    if (codeServer) {
      await codeServer.dispose()
      codeServer = undefined
    }
  })

  it("should generate cert and connect to websocket without errors", async () => {
    // NOTES@jsjoeio
    // We connect to /healthz via a websocket
    // and send a message and then we expect it to work
    // with our HTTPS server
    // and the cert arg passed in as well.
    codeServer = await integration.setup(["--auth=none", "--cert"], "")
    // NOTE@jsjoeio - do we need to use a dynamic reconnection token that we get from somewhere?
    const ws = codeServer.ws(
      "/?type=ExtensionHost&reconnectionToken=dc170cd8-e33c-4519-a6a3-5ef050c27e59&reconnection=false&skipWebSocketFrames=false",
    )
    const errorMessages = []
    const message = await new Promise((resolve, reject) => {
      ws.on("error", (err) => {
        errorMessages.push(err)
      })
      ws.on("message", (message) => {
        try {
          const j = JSON.parse(message.toString())
          resolve(j)
        } catch (error) {
          reject(error)
        }
      })
      ws.on("open", () => ws.send(JSON.stringify({ event: "test" })))
    })
    ws.terminate()
    expect(errorMessages.length).toBe(0)
    expect(message).toStrictEqual({ event: "test" })
  })
})
