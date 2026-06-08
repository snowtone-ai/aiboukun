# Project AGENTS.md -- pm-zero v9.5

## Language
- Completion reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately.

## Source of Truth
- Product intent: docs/vision.md
- Execution tasks: tasks.md
- Current state: docs/state.md
- Decisions: docs/decisions.md
- Failures: docs/issues.md
- Repository map: docs/repo-map.md
- Report: HANDOFF-JA.md

## Startup Read
1. Read this file.
2. Read docs/repo-map.md — file locations, critical flows, change routes.
3. Read docs/state.md — current phase, blockers, next task.
4. Read tasks.md only if about to implement or coordinate.

## Repository Navigation
- Navigate via docs/repo-map.md first. File paths are listed there.
- Structural queries (callers, callees, impact): use CodeGraph (`codegraph_*`). See `.claude/CLAUDE.md` for tool reference.
- Literal text queries (log messages, string contents): use rg/grep.
- Do not grep or read broadly before consulting repo-map.md and CodeGraph.
- Update docs/repo-map.md after structural changes to src/ or new top-level directories.

## Task Ledger Rule
- tasks.md is the only execution ledger.
- Every ready task includes owner, dependencies, write scope, acceptance, verification, and evidence.
- CEO Agent updates tasks.md and docs/state.md as coordinator.

## Agent Coordination
- CEO Agent owns tasks.md and docs/state.md as coordinator.
- CEO Agent decides whether to parallelize based on Write Scope separation.
- Worker agents may edit only their assigned Write Scope.
- Parallel implementation requires disjoint Write Scopes or isolated worktrees.
- Same file -> serialize. Separate scope -> parallelize.
- Maximum 3 concurrent agents including CEO.

## Quality Standards
- Refer to Quality Gates in pm-zero-knowledge-v9.5 Section 10.
- Keep files and functions small enough to review (target 300 lines / 50 lines).
- After 3 consecutive identical errors, record in docs/issues.md and pause.
- 300+ line diffs: split or explain in docs/decisions.md.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.

## Engineering Role
- Act as a principal-level full-stack engineer.
- Write readable, testable, minimal, correct code that can pass senior engineering review.
- Do not write placeholder code or TODOs. Every committed function must work.

## Thinking Protocol
- Before code changes, decompose the task into atomic subtasks.
- Challenge assumptions from first principles and prefer the simplest correct solution.
- Compare three conceptual implementation skeletons for correctness, simplicity, testability, and cost; choose one explicitly in working notes or reports.
- Use Chain-of-Verification: draft internally, plan failure-revealing checks, verify independently, then revise using only verified facts.
- Do not output long reasoning in one shot. Provide short progress checks.
- Before using an external API or library function, verify the actual call shape or run a minimal test when uncertain.

## Coding Priorities
- Security
- Reliability
- Monitoring
- Maintainability
- Scalability
- UX polish

## Product Context
- Product: アイボウくん
- Definition: Googleマップ集客の営業・マーケティング担当AIエージェント
- Value prop: 月1万円で雇えるAI相棒（管理ツールではなく担当者）
- Target users: 個人店オーナー、店長、多店舗本部
- Core domain: Google口コミ管理、低評価検知、競合比較、レポート自動生成
- AI provider: Gemini API（開発時）/ LLM Provider Adapter経由で切替可（商用時）
- Primary integration: Google Business Profile API + OAuth

## Commands
- install: pnpm install
- lint: pnpm lint
- typecheck: pnpm typecheck
- test: pnpm test
- build: pnpm build
- verify: node scripts/verify.mjs
- setup: node scripts/setup.mjs

Use only commands that exist in this repository.

## Execution Boundaries
- Use PowerShell.
- Use standard push with branch tracking.
- Handle every error explicitly.
- Keep safe values only in output.
- Use .env.example as template; runtime reads actual env values.
- Authentication, billing, production deploy final approval, and personal data handling are human tasks.
- All other operations are AI-executed.


## Git Workflow

### Branches
- Never commit directly to `main`. Always work on a dedicated branch.
- Naming: `<type>/<short-description>` — e.g. `feat/add-auth`, `fix/null-check`, `docs/update-readme`, `security/harden-gitignore`.
- Create the branch at the start of the task, not after implementation.

### Commits
- Commit after each logically complete unit of work. Do not accumulate changes and commit at session end.
- Format: `<type>: <short description>` — types: `feat` / `fix` / `docs` / `refactor` / `security` / `chore` / `test`.
- Stage only files within the task's Write Scope. Never stage `.env*`, secrets, or credential files.
- Every committed function must work. No placeholder code.

### Push
- Push after every commit. Do not leave commits local-only.
- First push: `git push -u origin <branch>`. Subsequent: `git push`.

### Pull Requests
- Open a PR to `main` when the branch is complete. Do not wait for the user to ask.
- PR title: conventional commit format matching the branch type.
- PR body: what changed and why.

### Pre-push Security Check
- Confirm `.gitignore` covers secret and credential patterns before the first push on any branch.
- Run `gitleaks git --no-banner` if gitleaks is available.
- If secrets are staged, untrack them and update `.gitignore` before pushing.

## Critical Rules
- Never auto-post replies to Google for reviews rated 1-3 stars.
- Never auto-post replies flagged as legal, medical, privacy, or escalation risk.
- Always require human approval before posting to Google Business Profile.
- Tenant isolation: store data must never cross organization boundaries.
- OAuth tokens must be encrypted at rest.

## Model Routing
- Default planning: Claude Code.
- Default implementation: Codex CLI.
- Either agent can perform the full workflow when needed.
- Critical changes: review by a model or vendor different from the implementer.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.
