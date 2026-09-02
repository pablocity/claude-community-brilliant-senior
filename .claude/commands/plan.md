---
description: Explore, then write a buildable plan to a file. Does not implement anything.
allowed-tools: Read, Glob, Grep, Write, Bash(git log:*), Bash(git status:*)
disable-model-invocation: true
---

The task: $ARGUMENTS

## What to do

1. **Hand the wide search to the `explorer` subagent.** Naming it here is the point: if
   you already know you want a subagent, do not leave it to the description to be picked.
   Twenty files read over there are twenty files that never enter this window.

2. **Write the plan to `docs/plans/YYYY-MM-<short-slug>.md`**, using exactly these
   sections. The template is in `docs/plans/TEMPLATE.md`.

   - `## Context` - why, and what the user ends up seeing
   - `## Files to touch` - each path, one line on what changes there
   - `## Interfaces` - the actual types, quoted from the code, not paraphrased
   - `## Test cases` - numbered, input and expected result
   - `## Acceptance` - the exact command that proves it
   - `## Out of scope` - and the reason for each

3. Stop there. Say the plan is ready for a `plan-reviewer` pass, and that it gets built
   with `/build` afterwards, not from this conversation.

## Rules

- **Do not implement anything.** No edits outside the plan file.
- The plan has to be buildable by someone with no access to this conversation. Every
  decision you made while exploring goes into the file, not into the chat. The
  conversation is exactly the context you are about to throw away.
- **Write the test cases before any implementation exists.** Expected results derived
  from code that already works assert whatever it happens to do and verify nothing.
- Quote interfaces from the code with a `file:line` reference. Do not describe them.
- "Out of scope" is the section that stops the implementer inventing extra work. Give a
  reason for each entry, not just the exclusion.
- Skip the plan entirely when you can describe the diff in one sentence. Planning costs
  tokens too, and planning a one-line change is theatre.
