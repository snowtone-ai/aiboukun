#!/usr/bin/env node
/**
 * scripts/setup.mjs -- pm-zero v9.5
 * アイボウくん 開発環境セットアップヘルパー
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

function run(cmd, label) {
  console.log(`\n[setup] ${label ?? cmd}`)
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT, shell: true })
  } catch (err) {
    console.error(`[setup] FAILED: ${label ?? cmd}`)
    process.exit(1)
  }
}

function check(cmd, label) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', shell: true }).trim()
    console.log(`[setup] OK: ${label ?? cmd} -> ${out}`)
  } catch {
    console.error(`[setup] MISSING: ${label ?? cmd}`)
    process.exit(1)
  }
}

console.log('=== アイボウくん setup ===')

// Phase 0: toolchain check
console.log('\n--- Phase 0: Toolchain ---')
check('node --version', 'node')
check('pnpm --version', 'pnpm')
check('git --version', 'git')

// .env.local check
if (!existsSync(resolve(ROOT, '.env.local'))) {
  console.warn('\n[setup] WARNING: .env.local が存在しません。.env.example をコピーして設定してください。')
  console.warn('  cp .env.example .env.local')
}

// install
run('pnpm install', 'pnpm install')

// prisma generate (if schema exists)
if (existsSync(resolve(ROOT, 'prisma/schema.prisma'))) {
  run('pnpm exec prisma generate', 'prisma generate')
}

console.log('\n[setup] 完了。次は: pnpm dev')
