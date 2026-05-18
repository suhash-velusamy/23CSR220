const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const fetch = global.fetch || require('node-fetch')

const API_BASE = 'http://4.224.186.213/evaluation-service'
const AUTH_URL = process.env.AUTH_URL
const STATIC_TOKEN = process.env.LOG_API_TOKEN || process.env.AUTH_TOKEN
const AUTH_CREDENTIALS = {
  email: process.env.EMAIL,
  name: process.env.NAME,
  rollNo: process.env.ROLLNO,
  accessCode: process.env.ACCESS_CODE,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
}

let cachedToken = null

async function getApiToken() {
  if (cachedToken) return cachedToken
  if (AUTH_URL && AUTH_CREDENTIALS.email && AUTH_CREDENTIALS.name && AUTH_CREDENTIALS.rollNo && AUTH_CREDENTIALS.accessCode && AUTH_CREDENTIALS.clientID && AUTH_CREDENTIALS.clientSecret) {
    const authRes = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(AUTH_CREDENTIALS),
    })

    if (authRes.ok) {
      const data = await authRes.json()
      if (data.access_token) {
        cachedToken = data.access_token
        return cachedToken
      }
    }
  }

  if (STATIC_TOKEN) {
    cachedToken = STATIC_TOKEN
    return cachedToken
  }

  throw new Error('LOG_API_TOKEN, AUTH_TOKEN, or full auth credentials are required in .env')
}

async function getJson(path) {
  const token = await getApiToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Failed ${path}: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function solveKnapsack(tasks, capacity) {
  const n = tasks.length
  const dp = Array.from({ length: capacity + 1 }, () => 0)
  const take = Array.from({ length: capacity + 1 }, () => [])

  for (let i = 0; i < n; i++) {
    const { Duration: w, Impact: v, TaskID } = tasks[i]
    for (let c = capacity; c >= w; c--) {
      const candidate = dp[c - w] + v
      if (candidate > dp[c]) {
        dp[c] = candidate
        take[c] = [...take[c - w], tasks[i]]
      }
    }
  }

  return {
    score: dp[capacity],
    selected: take[capacity],
    hours: take[capacity].reduce((sum, task) => sum + task.Duration, 0),
  }
}

async function main() {
  const depotsData = await getJson('/depots')
  const vehiclesData = await getJson('/vehicles')

  const tasks = vehiclesData.vehicles || vehiclesData
  const depots = depotsData.depots || depotsData

  for (const depot of depots) {
    const { ID, MechanicHours } = depot
    const result = solveKnapsack(tasks, MechanicHours)

    console.log('Depot:', ID)
    console.log('Budget hours:', MechanicHours)
    console.log('Total impact score:', result.score)
    console.log('Hours used:', result.hours)
    console.log('Selected tasks:', result.selected.map((t) => ({
      TaskID: t.TaskID,
      Duration: t.Duration,
      Impact: t.Impact,
    })))
    console.log('---')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})