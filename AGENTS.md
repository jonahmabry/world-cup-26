<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branching policy

Before making any code changes, always create a new feature branch. Never commit directly to `master` or to an existing long-lived branch such as `hardening`. Use a descriptive name derived from the change being made (e.g. `feat/bracket-tree`, `fix/standings-tiebreak`). The branch must exist before the first file edit.

# OpenSpec change completion

After completing all implementation tasks for an OpenSpec change, always: commit all staged files with a descriptive message, push the branch to origin, and open a pull request on GitHub. Do this without waiting to be asked.
