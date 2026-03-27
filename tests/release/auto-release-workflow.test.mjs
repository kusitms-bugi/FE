import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

const autoReleaseWorkflowPath = new URL(
  '../../.github/workflows/auto-release.yml',
  import.meta.url,
)
const electronReleaseWorkflowPath = new URL(
  '../../.github/workflows/electron-release.yml',
  import.meta.url,
)
const releaseWorkflowPath = new URL(
  '../../.github/workflows/release.yml',
  import.meta.url,
)

test('auto-release workflow triggers on merged main PRs and runs release preparation', async () => {
  const workflow = await fs.readFile(autoReleaseWorkflowPath, 'utf8')

  assert.match(workflow, /pull_request:\s*\n\s*types:\s*\[[^\]]*closed[^\]]*\]/)
  assert.match(workflow, /branches:\s*\[[^\]]*main[^\]]*\]/)
  assert.match(workflow, /scripts\/release\/prepare-release\.mjs/)
  assert.match(workflow, /release_commit_message/)
})

test('electron release workflow keeps tag releases and restricts manual exceptions', async () => {
  const workflow = await fs.readFile(electronReleaseWorkflowPath, 'utf8')

  assert.match(workflow, /tags:\s*\n\s*-\s*'v\*'/)
  assert.match(
    workflow,
    /reason:\s*\n\s*description: 'Approved manual release reason'/,
  )
  assert.match(workflow, /options:\s*\n\s*-\s*auto_release_recovery/)
  assert.match(workflow, /scripts\/release\/summarize-release-failure\.mjs/)
})

test('release notes workflow includes automated release policy context', async () => {
  const workflow = await fs.readFile(releaseWorkflowPath, 'utf8')

  assert.match(workflow, /Automated Release Policy/)
  assert.match(workflow, /release:major/)
  assert.match(workflow, /main merge path/)
})
