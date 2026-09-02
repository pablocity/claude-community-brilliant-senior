---
description: Report where the project stands and what the next concrete step is. Reads state, does not start work.
allowed-tools: Read, Glob, Grep, Bash(git log:*), Bash(git status:*), Bash(ls:*)
disable-model-invocation: true
---

Current state file:

@docs/STATE.md

Recent commits:

!`git log --oneline -12`

Working tree:

!`git status --short --branch`

Newest plans:

!`ls -t docs/plans`

## What to do

1. Read `docs/STATE.md` above, then read the newest file in `docs/plans/`.
2. Report, in this order and nothing more:

   - **Where we are** - three or four sentences. What is committed, what is in the tree,
     what the current plan is about.
   - **Next concrete step** - one specific action, not a list of options. Draw it from
     "In flight" or "Open questions".
   - **Looks stale** - anything the output above contradicts. Specifically check:
     - claims in `docs/STATE.md` that `git log` or `git status` disagree with
     - work described as "uncommitted" that a commit message says landed
     - a branch position the state file states and git does not
     - CHANGE: add the checks that are specific to your project here. This is the
       section that pays, and it only pays for things you actually get wrong.

     If nothing is stale, write "nothing".

## Rules

- **Do not start work.** No edits, no builds, no exploring beyond the reads above. This
  command orients; the next message decides.
- Do not restate `STATE.md`. The point is the delta between what it claims and what the
  repo shows.
- Report the delta even when it is embarrassing. A state file nobody contradicts is a
  state file nobody reads.
