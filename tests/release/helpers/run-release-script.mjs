import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export async function runReleaseScript(
  scriptPath,
  { cwd, env = {}, args = [] } = {},
) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bugi-release-test-'))
  const outputPath = path.join(tempDir, 'github-output.txt')
  const summaryPath = path.join(tempDir, 'github-summary.md')

  const result = await new Promise(resolve => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd,
      env: {
        ...process.env,
        GITHUB_OUTPUT: outputPath,
        GITHUB_STEP_SUMMARY: summaryPath,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('close', code => resolve({ code, stdout, stderr }))
  })

  const outputs = {}
  try {
    const rawOutputs = await fs.readFile(outputPath, 'utf8')
    for (const line of rawOutputs.split('\n')) {
      if (!line.includes('=')) {
        continue
      }
      const [key, ...rest] = line.split('=')
      outputs[key] = rest.join('=')
    }
  } catch {}

  let summary = ''
  try {
    summary = await fs.readFile(summaryPath, 'utf8')
  } catch {}

  await fs.rm(tempDir, { recursive: true, force: true })

  return {
    ...result,
    outputs,
    summary,
  }
}
