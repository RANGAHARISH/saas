import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { setTimeout as delay } from "node:timers/promises"

// Run after a production build: node scripts/test-deployment.mjs
const scenarios = [
  { name: "missing database and auth secret", database: "", mock: "false", unavailable: true },
  {
    name: "unreachable database",
    database: "postgresql://test:test@127.0.0.1:1/test",
    mock: "false",
    unavailable: true,
  },
  { name: "explicit demo mode", database: "", mock: "true", unavailable: false },
]

for (const [index, scenario] of scenarios.entries()) {
  const port = 3190 + index
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      env: {
        ...process.env,
        NODE_ENV: "production",
        DATABASE_URL: scenario.database,
        BETTER_AUTH_SECRET: "",
        USE_MOCK_DATA: scenario.mock,
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  )
  let logs = ""
  server.stdout.on("data", (chunk) => {
    logs += chunk
  })
  server.stderr.on("data", (chunk) => {
    logs += chunk
  })
  try {
    let response
    for (let attempt = 0; attempt < 60; attempt++) {
      if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`)
      try {
        response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(15000) })
        break
      } catch {
        await delay(500)
      }
    }
    assert.ok(response, `Server did not respond: ${logs}`)
    assert.equal(response.status, 200, logs)
    const html = await response.text()
    assert.ok(html.includes("SaaSFlock"), "Site layout must remain visible")
    assert.equal(html.includes("Projects are temporarily unavailable"), scenario.unavailable)
    if (!scenario.unavailable) assert.ok(html.includes("Top Projects Launching Today"))
    assert.ok(!html.includes('"digest":"3393308094"'), "Database error must not escape rendering")
    console.log(`PASS: ${scenario.name}`)
  } finally {
    if (server.exitCode === null) {
      const exited = once(server, "exit")
      server.kill()
      await exited
    }
  }
}
