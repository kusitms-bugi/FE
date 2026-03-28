import { determineVersion } from './determine-version.mjs'
import {
  appendStepSummary,
  assessRequiredChecks,
  getHeadSha,
  getLatestStableTag,
  getPullRequestFromEvent,
  getTagSha,
  loadEventPayloadFromEnv,
  normalizeTag,
  normalizePullRequest,
  parseJson,
  readPackageJson,
  writeGithubOutputs,
  writePackageVersion,
} from './shared.mjs'

function toSummaryMarkdown(result) {
  const lines = ['## Auto Release Orchestration']
  lines.push(`- Status: \`${result.status}\``)
  lines.push(`- Head SHA: \`${result.head_sha ?? 'n/a'}\``)
  lines.push(`- Current version: \`${result.current_version ?? 'n/a'}\``)
  lines.push(`- Next version: \`${result.next_version ?? 'n/a'}\``)
  lines.push(`- Tag: \`${result.tag ?? 'n/a'}\``)
  if (result.failure_stage) {
    lines.push(`- Failure stage: \`${result.failure_stage}\``)
    lines.push(`- Message: ${result.message}`)
  } else {
    lines.push(`- Decision: ${result.decision_reason}`)
  }
  return lines.join('\n')
}

export async function prepareRelease({
  cwd = process.cwd(),
  checkRuns = [],
  dryRun = false,
  eventPayload,
} = {}) {
  const payload = eventPayload ?? (await loadEventPayloadFromEnv())
  const pullRequest = normalizePullRequest(getPullRequestFromEvent(payload))
  const packageJson = await readPackageJson(cwd)
  const currentVersion = packageJson.version
  const headSha =
    pullRequest?.merge_commit_sha ?? payload?.after ?? (await getHeadSha(cwd))
  const lastReleasedTag = await getLatestStableTag(cwd)
  const lastReleasedSha = await getTagSha(lastReleasedTag, cwd)

  if (!pullRequest?.merged) {
    return {
      status: 'blocked',
      should_release: false,
      failure_stage: 'merge_event',
      message:
        'Pull request is not merged; release orchestration only runs for merged PRs.',
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  if (pullRequest.base?.ref !== 'main') {
    return {
      status: 'blocked',
      should_release: false,
      failure_stage: 'base_branch',
      message: `Merged PR targets ${pullRequest.base?.ref}; only main is allowed.`,
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  if (lastReleasedSha && lastReleasedSha === headSha) {
    return {
      status: 'duplicate',
      should_release: false,
      failure_stage: 'duplicate_release',
      message: `HEAD ${headSha} already matches the latest release tag ${lastReleasedTag}.`,
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  const checkStatus = assessRequiredChecks(checkRuns)
  if (!checkStatus.ok) {
    return {
      status: 'blocked',
      should_release: false,
      failure_stage: 'quality_gate',
      message: `Required checks are not green. Missing: ${checkStatus.missing.join(', ') || 'none'}. Failing: ${checkStatus.failing.map(run => `${run.name}:${run.conclusion}`).join(', ') || 'none'}.`,
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  let decision
  try {
    decision = determineVersion({
      currentVersion,
      labels: pullRequest.labels ?? [],
    })
  } catch (error) {
    return {
      status: 'blocked',
      should_release: false,
      failure_stage: 'version_decision',
      message: error.message,
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  const tag = normalizeTag(decision.next_version)
  if (tag === lastReleasedTag) {
    return {
      status: 'duplicate',
      should_release: false,
      failure_stage: 'duplicate_release',
      message: `Tag ${tag} already exists as the latest release.`,
      current_version: currentVersion,
      head_sha: headSha,
      last_released_tag: lastReleasedTag ?? '',
    }
  }

  if (!dryRun) {
    await writePackageVersion(decision.next_version, cwd)
  }

  return {
    status: 'ready',
    should_release: true,
    current_version: currentVersion,
    next_version: decision.next_version,
    bump_type: decision.bump_type,
    decision_source: decision.decision_source,
    decision_reason: decision.decision_reason,
    head_sha: headSha,
    last_released_tag: lastReleasedTag ?? '',
    merged_pr_number: pullRequest.number,
    tag,
    release_commit_message: `chore(release): prepare ${tag}`,
  }
}

async function main() {
  const dryRun =
    process.argv.includes('--dry-run') || process.env.RELEASE_DRY_RUN === 'true'
  const checkRuns = parseJson(process.env.RELEASE_CHECKS_JSON, [])
  const result = await prepareRelease({
    checkRuns,
    dryRun,
  })

  await writeGithubOutputs(result)
  await appendStepSummary(toSummaryMarkdown(result))
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
