import { appendStepSummary, parseJson, writeGithubOutputs } from './shared.mjs'

const EARLY_FAILURE_STAGES = new Set([
  'quality_gate',
  'version_decision',
  'version_sync',
  'tag_push',
])

export function summarizeReleaseFailure(input) {
  const stageStatuses = input.stage_statuses ?? []
  const failedStage = stageStatuses.find(stage => stage.status === 'failure')
  const successfulPlatforms = stageStatuses.filter(
    stage =>
      (stage.stage_name === 'mac_release' ||
        stage.stage_name === 'win_release') &&
      stage.status === 'success',
  )
  const failedPlatforms = stageStatuses.filter(
    stage =>
      (stage.stage_name === 'mac_release' ||
        stage.stage_name === 'win_release') &&
      stage.status === 'failure',
  )

  let impactScope = 'release_pipeline_failure'
  let rollbackRecommended = false
  let nextAction =
    'Inspect the failing workflow step and retry once the cause is corrected.'
  let overallStatus = failedStage ? 'failure' : 'success'

  if (!failedStage) {
    return {
      execution_id: input.execution_id,
      version: input.version,
      failed_stage: '',
      impact_scope: 'release_success',
      next_action: 'No action required.',
      rollback_recommended: false,
      overall_status: 'success',
      rationale: 'All tracked release stages completed successfully.',
      markdown: [
        '## Release Summary',
        `- Execution ID: \`${input.execution_id}\``,
        `- Version: \`${input.version}\``,
        '- Overall status: `success`',
        '- Rollback recommended: `false`',
      ].join('\n'),
    }
  }

  if (EARLY_FAILURE_STAGES.has(failedStage.stage_name)) {
    impactScope = 'release_not_started'
    nextAction =
      'Fix the pre-release validation issue, then rerun the orchestration workflow.'
  } else if (failedStage.stage_name === 'release_notes') {
    impactScope = 'release_notes_missing'
    nextAction =
      'Regenerate the GitHub Release notes for the existing tag and verify the published body.'
  } else if (failedStage.stage_name === 'updater_metadata') {
    impactScope = 'updater_metadata_incomplete'
    rollbackRecommended = true
    nextAction =
      'Repair the metadata upload before promoting the release to auto-update users.'
    overallStatus = 'partial_failure'
  } else if (successfulPlatforms.length > 0 && failedPlatforms.length > 0) {
    impactScope = 'partial_platform_release'
    rollbackRecommended = true
    nextAction =
      'Decide whether to roll back to the last stable tag or rebuild the failed platform immediately.'
    overallStatus = 'partial_failure'
  } else if (failedPlatforms.length > 0) {
    impactScope = 'platform_release_failed'
    nextAction =
      'Re-run the failed platform release job and confirm artifact publication.'
  }

  const rationale =
    failedStage.summary || 'Release failure detected from stage status inputs.'
  const markdown = [
    '## Release Failure Summary',
    `- Execution ID: \`${input.execution_id}\``,
    `- Version: \`${input.version}\``,
    `- Failed stage: \`${failedStage.stage_name}\``,
    `- Impact scope: \`${impactScope}\``,
    `- Overall status: \`${overallStatus}\``,
    `- Rollback recommended: \`${rollbackRecommended}\``,
    `- Next action: ${nextAction}`,
    `- Rationale: ${rationale}`,
  ].join('\n')

  return {
    execution_id: input.execution_id,
    version: input.version,
    failed_stage: failedStage.stage_name,
    impact_scope: impactScope,
    next_action: nextAction,
    rollback_recommended: rollbackRecommended,
    overall_status: overallStatus,
    rationale,
    markdown,
  }
}

async function main() {
  const input = parseJson(process.env.RELEASE_SUMMARY_INPUT_JSON)
  if (!input) {
    throw new Error('RELEASE_SUMMARY_INPUT_JSON is required')
  }

  const summary = summarizeReleaseFailure(input)
  await writeGithubOutputs(summary)
  await appendStepSummary(summary.markdown)
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
