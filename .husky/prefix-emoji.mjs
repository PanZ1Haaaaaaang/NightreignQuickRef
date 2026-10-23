import { readFileSync, writeFileSync } from 'fs';

const msgPath = process.argv[2];
let msg = readFileSync(msgPath, 'utf8');

// 如果已经有 emoji，就不重复加
if (/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u.test(msg)) {
  process.exit(0);
}

const EMOJI_MAP = {
  feat: '💙', // New feature
  fix: '🗡️', // Bug fix
  docs: '📜', // Documentation
  style: '🗝️', // Code style (formatting, indentation, etc., not CSS)
  refactor: '🧩', // Code refactoring
  perf: '🚀', // Performance improvement
  test: '⚔️', // Tests
  ui: '🩵', // UI styles/layout
  chore: '🛡️', // Chores (deps, config, build, etc.)
};

const match = msg.match(/^(\w+)(\(.+\))?:\s/);
if (!match) process.exit(0);

const type = match[1];
const emoji = EMOJI_MAP[type];

if (!emoji) process.exit(0);

// 注入 emoji
msg = `${emoji} ${msg}`;
writeFileSync(msgPath, msg, 'utf8');
