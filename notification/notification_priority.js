const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const NOTIFICATIONS_URL = 'http://4.224.186.213/evaluation-service/notifications'
const AUTH_URL = process.env.AUTH_URL
const TOKEN = process.env.AUTH_TOKEN || process.env.LOG_API_TOKEN

// creds for getting a fresh token
const CREDS = {
  email: process.env.EMAIL,
  name: process.env.NAME,
  rollNo: process.env.ROLLNO,
  accessCode: process.env.ACCESS_CODE,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
}

let currentToken = TOKEN

// get a fresh token if the old one is bad
async function freshToken() {
  if (!AUTH_URL) return null
  
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDS),
  })

  if (!res.ok) return null
  
  const data = await res.json()
  return data.access_token || null
}

const TYPE_WEIGHT = {
  Placement: 30,
  Result: 20,
  Event: 10,
}

function score(notification) {
  const typeScore = TYPE_WEIGHT[notification.Type] || 5
  const ageHours = (Date.now() - new Date(notification.Timestamp).getTime()) / 3600000
  const recency = 1 / (ageHours + 1)
  return typeScore + recency
}

async function loadNotifications() {
  let token = currentToken
  
  // try first call
  let res = await fetch(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  // if 401, get a fresh token and try again
  if (res.status === 401) {
    console.log('Token expired, getting a fresh one...')
    token = await freshToken()
    if (!token) throw new Error('Could not get fresh token')
    
    currentToken = token
    res = await fetch(NOTIFICATIONS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`)
  }

  const data = await res.json()
  return data.notifications || []
}

async function main() {
  console.log('Loading notifications...')
  const notifications = await loadNotifications()
  console.log(`Found ${notifications.length} notifications`)

  const top = notifications
    .map((item) => ({ ...item, score: score(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // output as JSON
  const result = {
    total: notifications.length,
    topCount: top.length,
    topNotifications: top.map((item) => ({
      id: item.ID,
      type: item.Type,
      message: item.Message,
      timestamp: item.Timestamp,
    })),
  }

  console.log('\n')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error('Error:', err.message)
})
