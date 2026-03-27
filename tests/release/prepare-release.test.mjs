import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import mergeEvents from './fixtures/merge-events.json' with { type: 'json' }
import releaseOutcomes from './fixtures/release-outcomes.json' with {
  type: 'json',
}

import { prepareRelease } from '../../scripts/release/prepare-release.mjs'

async function createTempRepo() {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'bugi-prepare-release-'))
  await fs.writeFile(
    path.join(cwd, 'package.json'),
    `${JSON.stringify({ name: 'bugi', version: '1.0.0' }, null, 2)}\n`,
    'utf8',
  )
  return cwd
}

test('prepareRelease syncs package.json and returns tag metadata', async () => {
  const cwd = await createTempRepo()
  const result = await prepareRelease({
    cwd,
    eventPayload: mergeEvents.successfulMerge,
    checkRuns: releaseOutcomes.requiredChecksGreen,
  })

  const pkg = JSON.parse(
    await fs.readFile(path.join(cwd, 'package.json'), 'utf8'),
  )
  assert.equal(result.status, 'ready')
  assert.equal(result.next_version, '1.1.0')
  assert.equal(result.tag, 'v1.1.0')
  assert.equal(pkg.version, '1.1.0')
})

test('prepareRelease supports dry-run without mutating package.json', async () => {
  const cwd = await createTempRepo()
  const result = await prepareRelease({
    cwd,
    dryRun: true,
    eventPayload: mergeEvents.successfulMerge,
    checkRuns: releaseOutcomes.requiredChecksGreen,
  })

  const pkg = JSON.parse(
    await fs.readFile(path.join(cwd, 'package.json'), 'utf8'),
  )
  assert.equal(result.status, 'ready')
  assert.equal(pkg.version, '1.0.0')
})
