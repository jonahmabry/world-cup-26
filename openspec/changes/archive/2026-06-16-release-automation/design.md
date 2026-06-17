## Context

The project ships through merged PRs to `master`, with Vercel deploying via its own
GitHub integration. Versioning/changelog/tagging was manual and has drifted (see
`proposal.md`). This change automates that release pipeline with Changesets while keeping
the package private (no registry publish).

## Decisions

### Tooling: Changesets

Changesets decouples *recording* a release note (a small markdown file committed with the
change) from *cutting* a release (an automated PR that aggregates pending changesets,
bumps the version, and rewrites the changelog). This fits a PR-per-change flow and a
multi-contributor future (the `bracket-challenge` roadmap item) better than ad-hoc tags.

Changelog entries use `@changesets/changelog-github`, which links each line to its PR and
author. Config: `"changelog": ["@changesets/changelog-github", { "repo":
"jonahmabry/world-cup-26" }]`.

### GitHub Releases only — `changeset tag`, not `changeset publish`

The package is `private: true` and is not published to any registry. So:

- The `release` script is `changeset tag` (creates git tags for the new version) — **not**
  `changeset publish` (which would attempt a registry publish).
- `.changeset/config.json` sets `"privatePackages": { "version": true, "tag": true }`.
  Without `tag: true`, Changesets skips tagging private packages and there would be
  nothing for the Action to turn into a GitHub Release.
- `changesets/action@v1` is given both `version: npm run version` and
  `publish: npm run release`. When the publish step produces new tags, the Action creates
  the corresponding GitHub Releases (its `createGithubReleases` default).

### Release trigger: bot PR on push to `master`

`release.yml` runs on `push` to `master`. With pending changesets present, the Action
opens/updates a **"Version Packages"** PR containing the version bump + changelog rewrite.
Merging that PR (a second push to `master`) makes the Action run the publish step, tag,
and release. This keeps every release reviewable as a normal PR. Required permissions:
`contents: write` (tags/releases/commits) and `pull-requests: write` (the bot PR). The
built-in `GITHUB_TOKEN` is sufficient — no PAT.

The workflow mirrors `ci.yml`'s runtime exactly (`actions/setup-node@v4`,
`node-version: '24'`, `cache: 'npm'`) so release runs match CI and `.nvmrc`/`engines`.

### Changelog coexistence

`changeset version` prepends new version blocks immediately after the changelog's first
line. We keep `CHANGELOG.md`'s H1 as the first line and retain the hand-written
`0.1.0`–`0.1.3` entries beneath it as a frozen pre-Changesets record; new auto-generated
entries land above that history. The old `[Unreleased]` planned-features list is removed —
it duplicated the blueprint roadmap, and pending work is now tracked by `.changeset/*.md`
files. The Keep-a-Changelog footer compare-links are trimmed to only `v0.1.0` (the one tag
that exists); future links are managed by Changesets.

### Forward-only drift reconcile

`package.json` is bumped `0.1.0` → `0.1.3` to match the changelog's latest documented
release. The missing `v0.1.1`–`v0.1.3` tags and their GitHub Releases are **not**
backfilled (explicit decision): retroactively tagging historical merge commits adds little
value versus making the *next* release correct. The first automated release will move from
`0.1.3` to the next version and create the first Changesets-managed tag/release.

### Versioning convention (pre-1.0)

Changesets has no special 0.x handling — a `minor` bump on `0.1.x` → `0.2.0`, `patch` →
`0.1.(x+1)`, `major` → `1.0.0`. To honor the policy already stated in `CHANGELOG.md`
(while pre-1.0: breaking → **minor**, feature/fix → **patch**, `1.0.0` reserved for the
tournament-stable launch), contributors choose `minor` for breaking changes and `patch`
otherwise, and avoid `major` until the 1.0.0 launch. This is documented in the spec and
README so the bump type maps predictably.

## Risks / Trade-offs

- **First release is only fully testable post-merge.** The bot-PR + GitHub-Release path
  needs a push to `master`. Pre-merge we validate config, YAML, `changeset status`, and a
  local `changeset version` dry-run (reverted); the first real run on `master` is the
  baseline. *Mitigation:* low blast radius — worst case the Action no-ops or the bot PR
  needs a tweak; no production/runtime impact.
- **Mixed changelog formatting.** Old entries use Keep-a-Changelog headings; new ones use
  the Changesets/`changelog-github` style. Accepted: history stays readable and the
  divergence is purely cosmetic below the latest release.
- **`changeset tag` + GitHub Release coupling.** Relies on the Action mapping new tags to
  releases for a private package. Verified by the first `master` run; if releases don't
  appear, set `createGithubReleases: true` explicitly.

## Migration

None. Tooling-only; no data or API changes.
