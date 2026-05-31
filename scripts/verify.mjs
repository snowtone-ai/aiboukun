#!/usr/bin/env node
/**
 * scripts/verify.mjs -- pm-zero v9.5
 * アイボウくん 統合検証エントリポイント
 *
 * Usage:
 *   node scripts/verify.mjs          # standard mode
 *   node scripts/verify.mjs --quick  # quick mode (docs/config changes)
 *   node scripts/verify.mjs --final  # final mode (pre-merge/deploy)
 */

import { execSync } from 'child_process'

const args = process.argv.slice(2)
const mode = args.includes('--final') ? 'final' : args.includes('--quick') ? 'quick' : 'standard'

console.log(`\n=== アイボウくん verify [${mode}] ===\n`)

const results = []

function step(label, cmd) {
  process.stdout.write(`[verify] ${label} ... `)
  try {
    execSync(cmd, { stdio: 'pipe', shell: true })
    console.log('OK')
    results.push({ label, status: 'ok' })
  } catch (err) {
    console.log('FAIL')
    console.error(err.stdout?.toString() ?? err.message)
    results.push({ label, status: 'fail' })
  }
}

// quick
step('git diff --check', 'git diff --check')

if (mode === 'standard' || mode === 'final') {
  step('lint', 'pnpm lint')
  step('typecheck', 'pnpm typecheck')
  step('build', 'pnpm build')
  step('test', 'pnpm test')
}

if (mode === 'final') {
  step('git status clean', 'git diff --quiet HEAD')
}

// summary
console.log('\n--- Summary ---')
let hasFailure = false
for (const r of results) {
  const mark = r.status === 'ok' ? '✓' : '✗'
  console.log(`  ${mark} ${r.label}`)
  if (r.status === 'fail') hasFailure = true
}

if (hasFailure) {
  console.error('\n[verify] FAILED')
  process.exit(1)
} else {
  console.log('\n[verify] ALL PASSED')
}
