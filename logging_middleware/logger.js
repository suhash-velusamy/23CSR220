

require('dotenv').config()

const validStacks = new Set(['backend', 'frontend'])
const validLevels = new Set(['debug', 'info', 'warn', 'error', 'fatal'])
const validPackages = new Set([
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
])

async function Log(stack, level, pkg, message) {
  if (!validStacks.has(stack)) {
    throw new Error(`Invalid stack: ${stack}`)
  }

  if (!validLevels.has(level)) {
    throw new Error(`Invalid level: ${level}`)
  }

  if (!validPackages.has(pkg)) {
    throw new Error(`Invalid package: ${pkg}`)
  }

  const url = process.env.LOG_API_URL || 'http://4.224.186.213/evaluation-service/logs'
  const token = process.env.LOG_API_TOKEN

  if (!token) {
    throw new Error('LOG_API_TOKEN is required in .env')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      stack,
      level,
      package: pkg,
      message,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Log request failed: ${response.status} ${response.statusText} ${text}`)
  }

  return response.json()
}

module.exports = { Log }