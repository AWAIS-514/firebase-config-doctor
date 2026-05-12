const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET  = '\x1b[0m';

function pass(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
}

function fail(message) {
  console.log(`${RED}✗${RESET} ${message}`);
}

function header(title) {
  console.log(`\n${YELLOW}--- ${title} ---${RESET}`);
}

function suggestions(list) {
  if (list.length === 0) return;

  console.log(`\n${YELLOW}Suggestions:${RESET}`);
  for (const suggestion of list) {
    console.log(`  - ${suggestion}`);
  }
}

module.exports = { pass, fail, header, suggestions };
