import assert from 'node:assert/strict'
import test from 'node:test'

import {
  REQUIRED_CHECKS,
  assessRequiredChecks,
  bumpSemver,
  getLabelNames,
  getReleaseLabelSet,
  normalizeTag,
} from '../../scripts/release/shared.mjs'

test('shared helpers expose the expected quality gates', () => {
  assert.deepEqual(REQUIRED_CHECKS, ['lint', 'typecheck', 'build'])
})

test('release label helpers keep only release labels', () => {
  const labels = [
    { name: 'release:minor' },
    { name: 'bug' },
    { name: 'release:patch' },
  ]
  assert.deepEqual(getLabelNames(labels), [
    'release:minor',
    'bug',
    'release:patch',
  ])
  assert.deepEqual(getReleaseLabelSet(labels), [
    'release:minor',
    'release:patch',
  ])
})

test('assessRequiredChecks reports missing and failing checks', () => {
  const result = assessRequiredChecks([
    { name: 'lint', conclusion: 'success' },
    { name: 'typecheck', conclusion: 'failure' },
  ])

  assert.equal(result.ok, false)
  assert.deepEqual(result.missing, ['build'])
  assert.deepEqual(result.failing, [
    { name: 'typecheck', status: 'completed', conclusion: 'failure' },
  ])
})

test('semver helpers bump and normalize versions', () => {
  assert.equal(bumpSemver('1.2.3', 'major'), '2.0.0')
  assert.equal(bumpSemver('1.2.3', 'minor'), '1.3.0')
  assert.equal(bumpSemver('1.2.3', 'patch'), '1.2.4')
  assert.equal(normalizeTag('1.2.4'), 'v1.2.4')
  assert.equal(normalizeTag('v1.2.4'), 'v1.2.4')
})
