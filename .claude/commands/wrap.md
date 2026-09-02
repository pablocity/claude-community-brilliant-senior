---
description: Rewrite docs/STATE.md to reflect this session, then show git status and a handoff paragraph. Does not commit.
allowed-tools: Read, Edit, Write, Bash(git log:*), Bash(git status:*), Bash(git diff:*)
disable-model-invocation: true
---

Current state file:

@docs/STATE.md

## What to do

1. **Rewrite `docs/STATE.md` so it describes the project as it stands right now.**
   It is a snapshot, not a log. That means:

   - **Delete** entries that are no longer true. Something that got done this session
     moves to "Recently shipped" or disappears; a question that got answered is removed,
     not annotated. A file that only grows is worthless, and the deleting is the work.
   - Keep the four sections exactly: `## In flight`, `## Open questions`,
     `## Recently shipped`, `## Scars`.
   - Keep "Recently shipped" to roughly the last ten items. Older ones are in git.
   - "Scars" only grows when a real dead end is found, and it is never pruned for
     length. Each entry needs the reason, not just the conclusion. "Do not do X" gets
     re-litigated by next week's session. "Do not do X because Y" does not.

2. Run `git status --short --branch` and show it.

3. Write one paragraph headed **For the next session**: what someone picking this up
   needs that is not in `STATE.md` already. Decisions made in conversation and the reason
   for them, things that look like mistakes and are not, traps in the tooling. If there is
   nothing of that kind, say so in one sentence rather than padding it.

## Rules

- **Do not commit and do not push.** Leave the working tree to be reviewed.
- Do not append. If you find yourself adding a line next to a line that contradicts it,
  delete one of them.
- CHANGE: if your project has generated files, say here whether they still need
  rebuilding after this session. Report it, do not run the build.
