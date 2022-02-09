import { describe, test } from "./baseFixture"

function testBasicExtension() {
  // This will only work if the test extension is loaded into code-server.
  test("should have access to VSCODE_PROXY_URI", async ({ codeServerPage }) => {
    const address = await codeServerPage.address()

    await codeServerPage.executeCommandViaMenus("code-server: Get proxy URI")

    await codeServerPage.page.waitForSelector(`text=${address}/proxy/{port}`)
  })
}

describe("Extensions", true, [], () => {
  testBasicExtension()
})

describe("Extensions with --cert", true, ["--cert"], () => {
  testBasicExtension()
})