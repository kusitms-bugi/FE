import {
  RELEASE_LABELS,
  bumpSemver,
  getLabelNames,
  getReleaseLabelSet,
  loadEventPayloadFromEnv,
  readPackageJson,
  writeGithubOutputs,
} from './shared.mjs'

export function determineVersion({ currentVersion, labels }) {
  const labelNames = getLabelNames(labels)
  const releaseLabels = getReleaseLabelSet(labelNames)
  const invalidReleaseLabels = releaseLabels.filter(
    label => !(label in RELEASE_LABELS),
  )

  if (invalidReleaseLabels.length > 0) {
    throw new Error(
      `Unsupported release label(s): ${invalidReleaseLabels.join(', ')}`,
    )
  }

  if (releaseLabels.length === 0) {
    throw new Error(
      'Missing release label. Exactly one of release:major, release:minor, release:patch is required.',
    )
  }

  if (releaseLabels.length > 1) {
    throw new Error(
      `Multiple release labels found: ${releaseLabels.join(', ')}`,
    )
  }

  const label = releaseLabels[0]
  const bumpType = RELEASE_LABELS[label]
  const nextVersion = bumpSemver(currentVersion, bumpType)

  return {
    current_version: currentVersion,
    next_version: nextVersion,
    bump_type: bumpType,
    decision_source: label,
    decision_reason: `Determined from PR label ${label}`,
  }
}

async function main() {
  const pkg = await readPackageJson()
  const event = await loadEventPayloadFromEnv()
  const pullRequest = event.pull_request
  const result = determineVersion({
    currentVersion: pkg.version,
    labels: pullRequest?.labels ?? [],
  })

  await writeGithubOutputs(result)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
