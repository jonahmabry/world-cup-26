## Why

Releases are fully manual and have already drifted out of sync:

- `CHANGELOG.md` documents `0.1.0` → `0.1.3`, but only `v0.1.0` is git-tagged — there
  are **no** tags for `v0.1.1`, `v0.1.2`, or `v0.1.3`, and **no** GitHub Releases exist.
- `package.json` `version` is still `0.1.0`, three documented releases behind the
  changelog.
- The `CHANGELOG.md` footer compare-links reference tags that were never created
  (`v0.1.1`, `v0.1.2`) → broken links.

Every hand-cut release is a chance to forget a tag, a release, or a version bump — and
that has already happened. This change adopts **Changesets** so version bumps, changelog
entries, git tags, and GitHub Releases are generated automatically from per-change
`.changeset/*.md` files via a bot pull request, and reconciles the existing drift.

## What Changes

- **Adopt Changesets.** Add `@changesets/cli` + `@changesets/changelog-github` (dev
  deps), an initialized `.changeset/config.json`, and `changeset` / `version` /
  `release` npm scripts. Contributors record release notes by running `npx changeset`;
  the file is committed alongside the change.
- **Automated release workflow.** A new `.github/workflows/release.yml` runs
  `changesets/action@v1` on every push to `master`. As changesets accumulate it
  opens/updates a **"Version Packages"** PR; merging that PR bumps the version, rewrites
  `CHANGELOG.md`, creates the git tag, and publishes the GitHub Release.
- **GitHub Releases only — no npm publish.** The package is `private: true`. The release
  script is `changeset tag` (tags only); `.changeset/config.json` sets
  `privatePackages: { version: true, tag: true }` so the private package is still
  versioned and tagged. Nothing is published to a registry.
- **Changesets owns the changelog going forward.** Future entries are auto-generated via
  `@changesets/changelog-github`. The existing hand-written `0.1.0`–`0.1.3` history is
  preserved as the frozen pre-Changesets record; new entries are prepended above it.
- **Reconcile the drift (forward-only).** Bump `package.json` to `0.1.3` to match the
  changelog's latest documented version, and trim the `CHANGELOG.md` footer links so
  none reference a missing tag. The missing intermediate tags/releases are **not**
  backfilled.
- **Docs.** `README.md` gains a short contributor note about adding a changeset;
  `worldcup2026-tracker-blueprint.md` moves `release-automation` from Planned to Shipped.

No production code, APIs, or runtime behavior change — this is release-tooling only.

## Capabilities

### New Capabilities

- `release-automation`: automated version bumping, changelog generation, git tagging,
  and GitHub Release creation driven by Changesets, with a documented pre-1.0 versioning
  convention. GitHub Releases only (the private package is never published to a
  registry).

### Modified Capabilities

_None._

## Impact

- **New files:** `.changeset/config.json`, `.changeset/README.md`, the first
  `.changeset/*.md`; `.github/workflows/release.yml`.
- **Config:** `package.json` (dev deps, scripts, `version` 0.1.0 → 0.1.3);
  `package-lock.json` refreshed.
- **Docs:** `CHANGELOG.md` restructured for Changesets + footer links trimmed;
  `README.md`; `worldcup2026-tracker-blueprint.md`.
- **Dependencies:** `@changesets/cli`, `@changesets/changelog-github` — dev-only. No
  runtime dependency changes.
- **Risk:** low — no source changes. The first automated release (bot "Version Packages"
  PR + GitHub Release) can only be fully exercised after merge to `master`, since it
  requires a push to the base branch.
- **Out of scope:** backfilling `v0.1.1`–`v0.1.3` tags/releases (forward-only by
  decision); npm/registry publishing (package stays private); any dependency upgrades
  beyond the two `@changesets/*` dev deps.
