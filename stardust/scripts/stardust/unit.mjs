#!/usr/bin/env node
// unit.mjs — C-deliver / migrate unit ledger writer (stardust/rollout/progress.json by default).
// Usage: node stardust/scripts/stardust/unit.mjs <name> --status running|done|failed|pending
//          [--kind foundation|archetype|cluster|render|final] [--templates a,b] [--pages n] [--blocks n]
//          [--gates '<json>'] [--verdict "…"] [--file stardust/rollout/progress.json]
//        node stardust/scripts/stardust/unit.mjs list [--file …]
// --help prints this and exits without touching any file.
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 7).join('\n'));
  process.exit(args.length ? 0 : 2);
}
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d; };
const file = flag('--file', 'stardust/rollout/progress.json');
const data = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { _provenance: { writtenBy: 'stardust:replica (unit.mjs)' }, units: {} };
data.units ||= {};
const name = args[0];
if (name === 'list') {
  for (const [k, u] of Object.entries(data.units)) console.log(`${k.padEnd(28)} ${String(u.status).padEnd(8)} ${u.kind || ''}  ${u.verdict || ''}`);
  process.exit(0);
}
const now = new Date().toISOString();
const u = data.units[name] || {};
const status = flag('--status');
if (!status) { console.error('--status required'); process.exit(2); }
u.status = status;
if (flag('--kind')) u.kind = flag('--kind');
if (flag('--templates')) u.templates = flag('--templates').split(',').filter(Boolean);
if (flag('--pages')) u.pages = Number(flag('--pages'));
if (flag('--blocks')) u.blocks = Number(flag('--blocks'));
if (flag('--gates')) u.gates = JSON.parse(flag('--gates'));
if (flag('--verdict')) u.verdict = flag('--verdict');
if (status === 'running' && !u.startedAt) u.startedAt = now;
if (status === 'done' || status === 'failed') u.endedAt = now;
data.units[name] = u;
data.updatedAt = now;
mkdirSync(dirname(file), { recursive: true });
writeFileSync(`${file}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
renameSync(`${file}.tmp`, file);
console.log(`${name}: ${status}${u.verdict ? ` — ${u.verdict}` : ''} → ${file}`);
