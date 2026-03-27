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

test('prepareRelease blocks release when required checks fail', async () => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'bugi-quality-gate-'))
  await fs.writeFile(
    path.join(cwd, 'package.json'),
    `${JSON.stringify({ name: 'bugi', version: '1.0.0' }, null, 2)}\n`,
    'utf8',
  )

  const result = await prepareRelease({
    cwd,
    dryRun: true,
    eventPayload: mergeEvents.successfulMerge,
    checkRuns: releaseOutcomes.requiredChecksBlocked,
  })

  assert.equal(result.status, 'blocked')
  assert.equal(result.failure_stage, 'quality_gate')
  assert.match(result.message, /typecheck:failure/)
})
