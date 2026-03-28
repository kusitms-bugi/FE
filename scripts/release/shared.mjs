import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const REQUIRED_CHECKS = ['lint', 'typecheck', 'build']
export const RELEASE_LABELS = {
  'release:major': 'major',
  'release:minor': 'minor',
  'release:patch': 'patch',
}

export function parseJson(value, fallback = null) {
  if (!value) {
    return fallback
  }

  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export function getPullRequestFromEvent(eventPayload) {
  return (
    eventPayload?.pull_request ??
    eventPayload?.workflow_dispatch?.pull_request ??
    null
  )
}

export function normalizePullRequest(pullRequest) {
  if (!pullRequest) {
    return null
  }

  return {
    ...pullRequest,
    merged:
      typeof pullRequest.merged === 'boolean'
        ? pullRequest.merged
        : Boolean(pullRequest.merged_at),
  }
}

export function getLabelNames(labels = []) {
  return labels
    .map(label => (typeof label === 'string' ? label : label?.name))
    .filter(Boolean)
}

export function getReleaseLabelSet(labels = []) {
  return getLabelNames(labels).filter(label => label.startsWith('release:'))
}

export function bumpSemver(version, bumpType) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`)
  }

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      throw new Error(`Unsupported bump type: ${bumpType}`)
  }
}

export function normalizeTag(version) {
  return version.startsWith('v') ? version : `v${version}`
}

export function assessRequiredChecks(
  checkRuns = [],
  requiredChecks = REQUIRED_CHECKS,
) {
  const indexed = new Map()
  for (const run of checkRuns) {
    indexed.set(run.name, run)
  }

  const missing = []
  const failing = []

  for (const name of requiredChecks) {
    const run = indexed.get(name)
    if (!run) {
      missing.push(name)
      continue
    }

    if (run.conclusion !== 'success') {
      failing.push({
        name,
        status: run.status ?? 'completed',
        conclusion: run.conclusion ?? 'unknown',
      })
    }
  }

  return {
    ok: missing.length === 0 && failing.length === 0,
    missing,
    failing,
  }
}

export async function git(
  args,
  cwd = process.cwd(),
  { allowFailure = false } = {},
) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd })
    return stdout.trim()
  } catch (error) {
    if (allowFailure) {
      return null
    }
    throw error
  }
}

export async function getHeadSha(cwd = process.cwd()) {
  return git(['rev-parse', 'HEAD'], cwd, { allowFailure: true })
}

export async function getLatestStableTag(cwd = process.cwd()) {
  const output = await git(
    ['tag', '--list', 'v*', '--sort=-version:refname'],
    cwd,
    {
      allowFailure: true,
    },
  )
  if (!output) {
    return null
  }
  return (
    output
      .split('\n')
      .map(tag => tag.trim())
      .find(Boolean) ?? null
  )
}

export async function getTagSha(tag, cwd = process.cwd()) {
  if (!tag) {
    return null
  }

  return git(['rev-list', '-n', '1', tag], cwd, { allowFailure: true })
}

export async function readPackageJson(cwd = process.cwd()) {
  const filePath = path.join(cwd, 'package.json')
  return readJsonFile(filePath)
}

export async function writePackageVersion(version, cwd = process.cwd()) {
  const filePath = path.join(cwd, 'package.json')
  const pkg = await readPackageJson(cwd)
  pkg.version = version
  await fs.writeFile(filePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  return pkg
}

export function writeGithubOutputs(outputs) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) {
    return
  }

  const lines = []
  for (const [key, value] of Object.entries(outputs)) {
    const normalizedValue = String(value ?? '')
    if (normalizedValue.includes('\n')) {
      lines.push(`${key}<<__BUGI_OUTPUT__`)
      lines.push(normalizedValue)
      lines.push('__BUGI_OUTPUT__')
      continue
    }

    lines.push(`${key}=${normalizedValue}`)
  }

  return fs.appendFile(outputPath, `${lines.join('\n')}\n`, 'utf8')
}

export async function appendStepSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (!summaryPath) {
    return
  }

  await fs.appendFile(summaryPath, `${markdown}\n`, 'utf8')
}

export async function loadEventPayloadFromEnv() {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (eventPath) {
    return readJsonFile(eventPath)
  }

  const payload = parseJson(process.env.GITHUB_EVENT_JSON)
  if (payload) {
    return payload
  }

  throw new Error(
    'No GitHub event payload found in GITHUB_EVENT_PATH or GITHUB_EVENT_JSON',
  )
}

export function parseCliFlag(flag) {
  return process.argv.includes(flag)
}
