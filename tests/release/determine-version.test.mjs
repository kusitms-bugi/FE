import assert from 'node:assert/strict'
import test from 'node:test'

import mergeEvents from './fixtures/merge-events.json' with { type: 'json' }

import { determineVersion } from '../../scripts/release/determine-version.mjs'

test('determineVersion applies the semver decision matrix', () => {
  const cases = [
    [{ name: 'release:major' }, 'major', '2.0.0'],
    [{ name: 'release:minor' }, 'minor', '1.1.0'],
    [{ name: 'release:patch' }, 'patch', '1.0.1'],
  ]

  for (const [label, bumpType, nextVersion] of cases) {
    const result = determineVersion({
      currentVersion: '1.0.0',
      labels: [label],
    })

    assert.equal(result.bump_type, bumpType)
    assert.equal(result.next_version, nextVersion)
  }
})

test('determineVersion rejects missing release metadata', () => {
  assert.throws(
    () =>
      determineVersion({
        currentVersion: '1.0.0',
        labels: mergeEvents.missingLabelMerge.pull_request.labels,
      }),
    /Missing release label/,
  )
})

test('determineVersion rejects duplicate release labels', () => {
  assert.throws(
    () =>
      determineVersion({
        currentVersion: '1.0.0',
        labels: mergeEvents.duplicateLabelMerge.pull_request.labels,
      }),
    /Multiple release labels/,
  )
})

test('determineVersion rejects unsupported release labels', () => {
  assert.throws(
    () =>
      determineVersion({
        currentVersion: '1.0.0',
        labels: [{ name: 'release:experimental' }],
      }),
    /Unsupported release label/,
  )
})
