# claude-community-brilliant-senior

The `.claude/` directory from the talk **"The brilliant senior with amnesia"**: the hook,
the subagents, the commands, and the two files that survive a `/clear`.

It is deliberately small. Everything here is markdown and one 120-line script, and that is
the whole point of the talk: there is no dashboard, no config service, nothing to install.

## The talk

| File | What it is |
|---|---|
| `talk/brilliant-senior.pl.html` | the deck as delivered, in Polish |
| `talk/brilliant-senior.en.html` | the English draft it was written from |

One self-contained file each. Open it in a browser: no server, no network, nothing to
install. Arrows or a click move a slide at a time, `F` is fullscreen, `O` is the overview,
and digits followed by Enter jump to a slide number.

Speaker notes are not in these files.

## Copy the mechanisms, not my content

Every rule, convention and dead end in these files is an answer to a question **my**
project asked. Yours asks different ones. Copied wholesale, this makes your setup worse,
because a config file full of someone else's answers is exactly the noise that drowns the
one rule you needed.

So each file has the mechanism intact and my content replaced by a marker:

```bash
grep -rn "CHANGE:" .
```

That command is the setup checklist. Fourteen places, listed file by file below. When it
returns nothing, you are done.

## The tree

```
CLAUDE.md                     project instructions, loaded into every session
.claude/
├── settings.json             permissions and hooks. committed, reviewed
├── settings.local.json       your machine only. gitignored, not in this repo
├── commands/
│   ├── plan.md               becomes /plan
│   ├── build.md              becomes /build
│   ├── wrap.md               becomes /wrap
│   └── catchup.md            becomes /catchup
├── agents/
│   ├── explorer.md           a subagent it can hand work to
│   └── plan-reviewer.md
└── scripts/
    └── verify-stop.mjs       what the Stop hook actually runs
docs/
├── STATE.md                  where the project is right now
└── plans/TEMPLATE.md         the shape of a plan worth reviewing
```

Copy `.claude/`, `CLAUDE.md` and `docs/` into your project root. There is nothing to
register: the filename is the command, and the `description` is what makes a subagent get
picked.

One difference from the tree on the slide, which had three commands: `/build` is here as a
fourth. On stage that step was a sentence I retyped every session, which by the argument
of the talk means it was a script I had not written down yet.

## The loop these add up to

```
/catchup   ->   /plan   ->   plan-reviewer   ->   /build   ->   /wrap

where am I      write the    attack it            tests first,    rewrite the state,
what is stale   contract     before anyone        failing, then   delete what died
                to a file    builds it            implement
```

And back to the top, in a clean window every time. The two ends of a session are the two
commands; everything between them happens in one context that you throw away afterwards.

## File by file, and what to change

### `.claude/settings.json`

Two things: a deny-list, and the Stop hook.

The deny-list is the one piece of config here that has never needed editing. Two
categories only: **things that touch production**, and **secrets it has no reason to
read**. An allow-list saves you clicks; a deny-list saves you an evening.

> **Change for yourself.** This is the only file with no `CHANGE:` markers, because JSON
> has no comments. Replace `Bash(git push --force:*)` and `Bash(npm publish:*)` with your
> own deploy and publish commands, whatever actually reaches production. Keep the `.env`
> and `*.pem` reads. Add any path where your project keeps credentials.

Two honest caveats. These patterns are **prefix matches**, so `Bash(git push --force:*)`
does not catch `git push origin main --force`. And a deny-list is a guard rail on an agent
that wants to cooperate, not a sandbox against one that does not. It stops the mistake you
would have approved at midnight without reading, which is the actual failure mode.

### `.claude/scripts/verify-stop.mjs` and the Stop hook

`Stop` fires when Claude finishes responding, at the moment the turn would end. Exit
codes are the contract:

| Exit code | What happens |
|---|---|
| `0` | let the turn end |
| `2` | **block the stop**, and hand your stderr back to the agent as the reason |

So it cannot end a turn on a red build. Not because it agreed not to. Because it cannot.
Exit 2 is the only code that blocks; anything else is a non-blocking error.

The script is three guards and one `execSync`, and the guards are the interesting part. A
hook that is annoying gets deleted, and then you have no hook:

1. **The loop guard.** A blocked stop makes the agent respond again, which fires `Stop`
   again. A gate that can never go green would trap the session, so the script caps
   blocks per session and then hands it back to you.
2. **No `node_modules`.** Nothing to run the gate against, so it does not try.
3. **A fingerprint of the watched paths.** Turns that changed no code do not pay for a
   full test run.

> **Change for yourself.** Three markers at the top of the file: `GATE` (the one command
> that decides whether the work is done), `WATCH` (the paths that make a green result
> stale), `MAX_BLOCKS`. If your project is not Node, replace the whole script; the exit
> codes are the only part that has to survive. On the slide the hook ran
> `npm run verify:stop`; here it calls the script directly so the repo works without a
> `package.json`.

The gate has to be something the agent can read the result of **without you**: a test
suite, a build exit code, a linter, a screenshot to compare against. Without one, "looks
done" is the only stop condition it has, and every mistake waits for a human to notice.

### `.claude/commands/*.md`

The filename is the command. The body is the prompt. The frontmatter is optional, except
that `allowed-tools` is what makes a read-only command actually read-only, and that is a
guarantee rather than a promise.

| Command | What it does |
|---|---|
| `/catchup` | reads `docs/STATE.md`, git log and status, then reports where you are, the next concrete step, and **what looks stale** |
| `/plan` | hands the wide search to `explorer`, writes the plan to `docs/plans/`, implements nothing |
| `/build` | implements a plan file, tests first, and shows them failing before any implementation exists |
| `/wrap` | rewrites `docs/STATE.md` as a snapshot, deletes what stopped being true, does not commit |

The third thing `/catchup` reports is the point. It reads what you claimed and checks it
against git. A context file rots, and the command that reads it back is what catches the
rot.

**Why test-first needs `/build` and not just `/plan`.** It takes three things, and none of
them is a clever prompt:

1. The expected results are written in the plan, before any code exists, so they cannot be
   derived from an implementation that does not exist yet.
2. **The build asks to see the tests fail first.** This is the step people skip, and
   skipping it is invisible: ask for the code and the tests together and you get both in
   one pass, all green, verifying nothing. The result looks identical to the real thing.
3. The Stop hook keeps it green afterwards.

Nothing here can verify that step 2 happened. That is the reason it is a command rather
than a habit: a habit is a sentence you retype slightly differently depending on how tired
you are, and this is the sentence that stops being said first.

> **Change for yourself.** `catchup.md` has a marker for the staleness checks that are
> specific to your project. Mine catch the things I actually get wrong, repeatedly: two
> files that are meant to stay in sync, and a build product older than its source. Yours
> will be different, and a generic check catches nothing. `wrap.md` has a marker for
> generated files that need rebuilding after a session.

`/plan` is worth skipping when you can describe the diff in one sentence. Planning costs
tokens too. It pays when you are unsure of the approach, when the change crosses many
files, or when you do not know that part of the code.

### `.claude/agents/*.md`

Same idea, different directory. Body is the system prompt, `tools` is what it may touch,
`model` and `effort` are what it costs.

| Agent | Model | Why |
|---|---|---|
| `explorer` | `haiku`, `effort: low` | reads twenty files, returns five lines. Grep does not need the best model in the world. |
| `plan-reviewer` | `opus`, `effort: high` | last check before an evening gets spent building the wrong thing. |

Two things people get wrong here.

**You do not invoke a subagent. The description does.** Nothing registers them anywhere.
Claude reads the `description` fields and decides whether a job is that agent's job. So
write it as *when to use this*, not what it is. A vague description never gets picked.
If you want it used reliably, name it in a command, which is what `/plan` does.

**A subagent is not a second Claude, it is a firewall for your context.** Searching the
repo costs the same tokens either way. The difference is whose window they fill. The
subagent reads twenty files and hands you five sentences, and those twenty files never
enter your session.

> **Change for yourself.** These two need the least editing, and both are worth keeping
> as they are on the first pass. What to adjust later: `plan-reviewer`'s "what counts as
> blocking" list, because a reviewer asked to find gaps will always find some, and
> capping it at correctness is what stops you getting defensive abstractions and tests for
> cases that cannot happen.

### `CLAUDE.md` and `docs/STATE.md`

The two files answer different questions, which is why they cannot be one file, and the
reason is mechanical rather than stylistic.

| | `CLAUDE.md` | `docs/STATE.md` |
|---|---|---|
| when it is read | **every session, every turn, automatically** | only when you ask, via `/catchup` |
| what goes in | how we work here. things that do not change | where we are now. things that do change |
| the test | would removing this line cause a mistake? | is this still true today? |

Put current state in `CLAUDE.md` and you pay three times: for stale facts on every turn,
in a file that only grows, until the rule you actually cared about drowns in it.

`STATE.md` has four sections, and `## Scars` is the one that pays for the whole file.
A dead end you did not write down is one you pay for twice, because it will look just as
reasonable the second time. Each entry carries its reason: "do not do X" gets
re-litigated, "do not do X because Y" does not.

> **Change for yourself.** Both files are markers end to end, and both are meant to be
> rewritten rather than filled in. `CLAUDE.md` is the bigger job and the one worth doing
> slowly. If it keeps ignoring one of your rules, the fix is usually to **delete the other
> rules**.

A file that only ever grows is worthless. The deleting is the work, which is why `/wrap`
is told to delete rather than annotate.

## Deliberately not here

- **`.claude/settings.local.json`.** Gitignored, and it should be. Mine had rotted into
  150 machine-specific allow entries and local paths. That asymmetry is the lesson: the
  six-line deny-list has never needed editing, the allow-list is unmaintainable and does
  not matter.
- **My actual `CLAUDE.md` and `STATE.md` content.** See the top of this file.
- **The plan files themselves.** Only the template. A real plan is worthless out of its
  repo.
- **Hooks beyond `Stop`.** About thirty events exist. The ones you will actually use are
  `PreToolUse` (refuse a command pattern outright), `PostToolUse` (run a formatter after
  every edit), `UserPromptSubmit`, `SessionStart` (inject current state), `Stop` and
  `SubagentStop`. One is enough to start with, and `Stop` is the one that pays first.

## If you only take three things

1. **Short sessions.** Quality falls with input length, long before you hit the limit.
   Have it write down what it learned, then `/clear`, then start from that file. You are
   throwing away the conversation and every wrong turn in it, not the knowledge.
2. **A hook that blocks on red.** Anything whose result it can read without you.
3. **A state file whose command deletes what died.**

## Credits

The mechanisms are from the Claude Code docs and from Anthropic's *Claude Code best
practices*. The opinions, and the scars behind them, are mine.
