#!/usr/bin/env node
/**
 * Memory file helpers — read/write markdown state files.
 * Run: node scripts/memory.js read portfolio
 *      node scripts/memory.js append journal "## Entry\nContent here"
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');

function filePath(name) {
  const p = path.join(MEMORY_DIR, `${name}.md`);
  return p;
}

function read(name) {
  const p = filePath(name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function write(name, content) {
  fs.writeFileSync(filePath(name), content, 'utf8');
}

function append(name, content) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  fs.appendFileSync(filePath(name), `\n---\n*${timestamp} ET*\n\n${content}\n`, 'utf8');
}

function readAll() {
  const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md'));
  return Object.fromEntries(files.map(f => [f.replace('.md', ''), read(f.replace('.md', ''))]));
}

// CLI
if (require.main === module) {
  const [, , cmd, name, ...rest] = process.argv;
  const content = rest.join(' ');
  if (cmd === 'read' && name) console.log(read(name) || '(empty)');
  else if (cmd === 'write' && name && content) write(name, content);
  else if (cmd === 'append' && name && content) append(name, content);
  else if (cmd === 'readAll') console.log(JSON.stringify(readAll(), null, 2));
  else console.log('Usage: memory.js read|write|append|readAll <name> [content]');
}

module.exports = { read, write, append, readAll };
