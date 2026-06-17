## 1. Adopt Changesets

- [x] 1.1 Add dev deps `@changesets/cli` and `@changesets/changelog-github`
- [x] 1.2 `npx changeset init` (creates `.changeset/config.json` + `.changeset/README.md`)
- [x] 1.3 Edit `.changeset/config.json`: `changelog` → `@changesets/changelog-github` with `{ "repo": "jonahmabry/world-cup-26" }`; `baseBranch` → `master`; `privatePackages` → `{ "version": true, "tag": true }`; `commit` → `false`; `access` → `restricted`
- [x] 1.4 `package.json` scripts: add `"changeset": "changeset"`, `"version": "changeset version"`, `"release": "changeset tag"`
- [x] 1.5 Add the first changeset (`.changeset/*.md`, `patch`) describing the release-automation change

## 2. Release workflow

- [x] 2.1 Add `.github/workflows/release.yml`: `on: push` to `master`; `permissions: contents: write` + `pull-requests: write`; `changesets/action@v1` with `version: npm run version` and `publish: npm run release`; `setup-node@v4` Node 24 + `cache: 'npm'` (mirrors `ci.yml`)

## 3. Reconcile drift (forward-only)

- [x] 3.1 `package.json` — bump `version` `0.1.0` → `0.1.3`
- [x] 3.2 `CHANGELOG.md` — keep H1 first line + hand-written `0.1.0`–`0.1.3` history; remove the `[Unreleased]` planned-features list (now tracked by changeset files); add a short note that future entries are auto-generated
- [x] 3.3 `CHANGELOG.md` — trim footer compare-links to only resolvable tags (`v0.1.0`); drop the broken `v0.1.1`/`v0.1.2` links

## 4. Documentation

- [x] 4.1 `README.md` — add a contributor note: run `npx changeset` to record a release note (and the pre-1.0 bump convention: breaking → minor, feat/fix → patch)
- [x] 4.2 `worldcup2026-tracker-blueprint.md` — move `release-automation` from Planned to Shipped

## 5. Verification

- [x] 5.1 `npm install` succeeds; `package-lock.json` refreshed
- [x] 5.2 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all green
- [x] 5.3 `npx changeset status --verbose` lists the pending changeset and its bump
- [x] 5.4 Dry-run `npm run version`: confirm `package.json` 0.1.3 → 0.1.4 and a correctly-formatted entry prepended **above** the preserved history; then `git restore package.json CHANGELOG.md` and delete the consumed changeset's regeneration (restore the `.changeset/*.md`)
- [x] 5.5 Validate `release.yml` YAML; confirm Node-24 setup matches `ci.yml`
- [x] 5.6 Push branch / open PR; confirm CI is green
- [ ] 5.7 Post-merge baseline: confirm the "Version Packages" bot PR appears and, on merge, a git tag + GitHub Release are created
