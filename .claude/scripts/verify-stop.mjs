#!/usr/bin/env node
// Stop hook. Refuses to let a turn end while the gate command is red.
//
// Exit codes are the contract, not shell convention:
//   0  let the turn end
//   2  block the stop, and hand stderr back to the agent as the reason
//
// Three guards keep it cheap and keep it from looping. That matters more than it
// sounds: a hook that is annoying gets deleted, and then you have no hook.

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// CHANGE: the one command that decides whether the work is done. It has to exit
// non-zero on failure, and it has to be fast enough that you leave it enabled.
const GATE = 'npm run verify';

// CHANGE: the paths whose contents make a previous green result stale. Anything
// outside these is invisible to the fingerprint guard below.
const WATCH = ['src', 'tests'];

// CHANGE: how many times one session may be blocked before the hook gives up.
// Without a cap, a gate that can never go green traps the session in a loop.
const MAX_BLOCKS = 2;

const STATE_DIR = path.join('.claude', '.verify-stop');

const input = readInput();
const state = readState(input.session_id);

// Guard 1, the loop guard. Stop hooks fire again after the agent responds to
// being blocked, so a gate that stays red would block forever.
if (state.blocks >= MAX_BLOCKS) {
  done(`blocked ${state.blocks} times in this session already, handing it back to you`);
}

// Guard 2. Nothing to run the gate against.
if (fs.existsSync('package.json') && !fs.existsSync('node_modules')) {
  done('no node_modules, skipping the gate');
}

// Guard 3. Conversational turns that changed no code should not pay for a full
// test run. The fingerprint is cheap; the gate is not.
const fingerprint = fingerprintOf(WATCH);
if (fingerprint && fingerprint === state.green) {
  done('nothing changed since the last green run');
}

try {
  execSync(GATE, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
} catch (err) {
  const output = `${err.stdout ?? ''}${err.stderr ?? ''}`.trimEnd();
  writeState(input.session_id, { blocks: state.blocks + 1, green: null });
  // Only stderr reaches the agent on exit 2. Say what failed and show enough of
  // the output to act on, not the whole run.
  process.stderr.write(
    `\`${GATE}\` failed, so the turn is not over. Fix it, then finish.\n\n${tail(output, 80)}\n`
  );
  process.exit(2);
}

writeState(input.session_id, { blocks: 0, green: fingerprint });
done('gate is green');

function readInput() {
  // The hook payload arrives as JSON on stdin: session_id, cwd, stop_reason,
  // last_assistant_message and friends. Missing stdin is not fatal.
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function stateFile(sessionId) {
  const safe = String(sessionId ?? 'unknown').replace(/[^\w-]/g, '');
  return path.join(STATE_DIR, `${safe || 'unknown'}.json`);
}

function readState(sessionId) {
  try {
    return { blocks: 0, green: null, ...JSON.parse(fs.readFileSync(stateFile(sessionId), 'utf8')) };
  } catch {
    return { blocks: 0, green: null };
  }
}

function writeState(sessionId, value) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(stateFile(sessionId), JSON.stringify(value));
}

function fingerprintOf(roots) {
  const parts = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const stat = fs.statSync(full);
        parts.push(`${full}:${stat.size}:${stat.mtimeMs}`);
      }
    }
  };
  for (const root of roots) {
    if (fs.existsSync(root)) walk(root);
  }
  // No watched path exists, so there is nothing to compare and the gate always runs.
  return parts.length ? createHash('sha1').update(parts.join('\n')).digest('hex') : null;
}

function tail(text, lines) {
  const all = text.split('\n');
  return all.length <= lines ? text : all.slice(-lines).join('\n');
}

function done(reason) {
  // Plain stdout from a Stop hook goes to the debug log, not to the agent.
  process.stdout.write(`verify-stop: ${reason}\n`);
  process.exit(0);
}
