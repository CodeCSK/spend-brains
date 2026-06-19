/**
 * Guardrail: features must import components/ui, not raw xp-btn/card/alert classes.
 * Allowed in components/ui/, index.css, and Storybook stories.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const FEATURES_DIR = join(ROOT, 'src', 'features')
const PATTERN = /\bxp-(btn-|card\b|alert-)/

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      walk(path, files)
    } else if (/\.(tsx|ts)$/.test(name)) {
      files.push(path)
    }
  }
  return files
}

const violations = []

for (const file of walk(FEATURES_DIR)) {
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    if (PATTERN.test(line)) {
      violations.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`)
    }
  })
}

if (violations.length > 0) {
  console.error(
    'Found raw xp-btn/card/alert classes in src/features/. Use components/ui instead:\n',
  )
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('check-feature-ui-classes: ok (no raw xp-btn/card/alert in features/)')
