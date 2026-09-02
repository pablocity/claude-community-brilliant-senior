# CLAUDE.md

Loaded into every session, automatically, on every turn. So it holds only things that do
not change. Where the project is right now lives in `docs/STATE.md`, which is read only
when you ask for it.

Test for every line below: **would removing this cause a mistake?** If not, cut it. This
file working well and this file being short are the same thing. Mine is about sixty lines.

Everything below is an example of the shape. Replace all of it.

## Commands

CHANGE: yours, and say which one is the gate.

```bash
npm run dev        # what you actually run while working
npm test           # the fast one
npm run verify     # THE GATE. the Stop hook runs this, it has to stay green
```

## How to see it running

CHANGE: the thing that is not derivable from the code, and that costs an hour when it is
missing. Example of the shape, from a real one:

> The frontend has no standalone mode. A dev server renders an empty shell, so there is
> nothing to look at until it is deployed. Use `npm run deploy:dev`, not `vite dev`.

This is the line people forget to write and the one that saves the most time.

## Conventions

CHANGE: only the ones it would plausibly break, tied to real paths.

- Dates are stored as UTC and formatted at the edge. Never format in a service.
- Anything under `src/domain/` has no imports from `src/api/`. The dependency goes one way.

## Rules

CHANGE: rules with consequences. A rule whose cost is invisible gets ignored.

- **Tests before implementation.** Run them, show the failures, then make them pass. A
  test written after the code asserts whatever the code does.
- **A comment that states an invariant is a test that does not exist yet.** Convert it.
- Do not commit unless asked.

## What does not belong in this file

Not a rule for the agent, a rule for you, and the reason the file stays useful:

- Anything it can read from the code itself. Describing the folder structure to something
  that can list folders is how this file gets long, and long is how it gets ignored.
- Current state, open questions, what shipped last week. That is `docs/STATE.md`. Put it
  here and you pay for stale facts on every turn of every session.
- Your list of subagents. Claude picks those by their `description` field. Listing them
  here costs context every turn and changes nothing.

If it keeps ignoring one of your rules, the fix is usually to **delete the other rules.**
A bloated file is exactly why the important line drowned.
