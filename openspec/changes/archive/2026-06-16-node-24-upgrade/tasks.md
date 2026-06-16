## 1. Runtime & engine declarations

- [x] 1.1 `package.json` — bump `@types/node` from `^20` to `^24`
- [x] 1.2 `package.json` — add `"engines": { "node": ">=24.0.0" }`
- [x] 1.3 Add `.nvmrc` at repo root containing `24`
- [x] 1.4 Run `npm install` to refresh `package-lock.json` with the new `@types/node`

## 2. CI runner

- [x] 2.1 `.github/workflows/ci.yml` — change `node-version: '20'` to `'24'` (keep `actions/setup-node@v4`, `cache: 'npm'`, and all existing steps)

## 3. Documentation

- [x] 3.1 `README.md` — update Prerequisites `Node.js 20+` → `Node.js 24+`
- [x] 3.2 `CHANGELOG.md` — reconcile the existing Unreleased `node-24-upgrade` entry with the shipped change

## 4. Verification

- [x] 4.1 Confirm local Node is 24 (matches `.nvmrc`); run `npm run typecheck` and resolve any error surfaced by the stricter `@types/node ^24` typings
- [x] 4.2 Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` locally — all green on Node 24
- [x] 4.3 `git grep -n "node-version\|@types/node\|Node.js 2"` shows no remaining `20` references
- [x] 4.4 Push the branch / open a PR and confirm the GitHub Actions run is green on Node 24 with no Node-20 deprecation warning
