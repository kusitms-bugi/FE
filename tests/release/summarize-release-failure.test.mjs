import assert from 'node:assert/strict'
import test from 'node:test'

import releaseFailures from './fixtures/release-failures.json' with {
  type: 'json',
}
import releaseOutcomes from './fixtures/release-outcomes.json' with {
  type: 'json',
}

import { summarizeReleaseFailure } from '../../scripts/release/summarize-release-failure.mjs'

test('summarizeReleaseFailure reports partial platform failures with rollback guidance', () => {
  const summary = summarizeReleaseFailure(
    releaseFailures.partialPlatformFailure,
  )

  assert.equal(summary.failed_stage, 'win_release')
  assert.equal(summary.impact_scope, 'partial_platform_release')
  assert.equal(summary.rollback_recommended, true)
  assert.equal(summary.overall_status, 'partial_failure')
})

test('summarizeReleaseFailure reports updater metadata failures separately', () => {
  const summary = summarizeReleaseFailure(releaseFailures.metadataFailure)

  assert.equal(summary.failed_stage, 'updater_metadata')
  assert.equal(summary.impact_scope, 'updater_metadata_incomplete')
  assert.equal(summary.rollback_recommended, true)
})

test('summarizeReleaseFailure returns success metadata when no failures exist', () => {
  const summary = summarizeReleaseFailure(releaseOutcomes.successfulStages)

  assert.equal(summary.overall_status, 'success')
  assert.equal(summary.rollback_recommended, false)
})
