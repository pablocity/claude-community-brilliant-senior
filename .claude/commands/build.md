---
description: Implement a plan file, test cases first, showing them fail before any implementation exists.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
disable-model-invocation: true
---

The plan to build: $ARGUMENTS

## What to do

1. Read the plan file. If nothing was named above, use the newest file in `docs/plans/`.

2. **Write the tests from its `## Test cases` section. Only the tests.** Do not create or
   edit a single implementation file in this step.

3. **Run them and show me the failing output before going any further.** Paste the real
   output, not a summary of it.

4. Then implement, against the plan file rather than against this conversation, until
   those tests pass.

5. Run the command in `## Acceptance` and show its output.

## Rules

- **The order is the whole point, not a preference.** A test that passes before the
  implementation exists is not a test, and that is exactly what you get if you write both
  in one pass. Step 3 is what makes the difference visible.
- **If a test passes at step 3, stop and say so.** That is a finding: either the behaviour
  already exists, or the test asserts nothing. Do not quietly move on.
- Build from the file, not from the chat. If something is not in the plan, it was not
  agreed.
- **Do not edit the plan to match what you built.** If the plan is wrong, say which
  section and why, and stop. A plan rewritten to match the code is a plan that verified
  nothing.
- `## Out of scope` stays out of scope. Say what you noticed and leave it.
- CHANGE: if your tests need a runner, a watch mode off, or a specific working directory,
  put that here. This is the step where a wrong command looks like a red test.
