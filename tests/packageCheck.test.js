const fs = require('fs');
const path = require('path');
const os = require('os');
const { runPackageCheck } = require('../checks/packageCheck');

function setup() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rn-pkg-'));
}

function teardown(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function run(dir) {
  const orig = console.log;
  console.log = () => {};
  const result = runPackageCheck(dir);
  console.log = orig;
  return result;
}

function writePackageJson(dir, deps = {}) {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', dependencies: deps }));
}

let passed = 0, failed = 0;
function assert(condition, name) {
  if (condition) { console.log(`  PASS: ${name}`); passed++; }
  else           { console.log(`  FAIL: ${name}`); failed++; }
}

// Firebase present → no suggestions
const t1 = setup();
writePackageJson(t1, { '@react-native-firebase/app': '^18.0.0' });
assert(run(t1).length === 0, 'Firebase installed → no suggestions');
teardown(t1);

// Firebase missing
const t2 = setup();
writePackageJson(t2, { react: '18.0.0', 'react-native': '0.72.0' });
assert(run(t2).some(s => s.includes('@react-native-firebase/app')), 'Firebase missing → install suggestion');
teardown(t2);

// No package.json
const t3 = setup();
assert(run(t3).length > 0, 'no package.json → suggestion');
teardown(t3);

// Malformed package.json
const t4 = setup();
fs.writeFileSync(path.join(t4, 'package.json'), '{ bad json }');
assert(run(t4).length > 0, 'malformed package.json → suggestion');
teardown(t4);

// Firebase in devDependencies (still valid)
const t5 = setup();
fs.writeFileSync(path.join(t5, 'package.json'), JSON.stringify({
  name: 'app',
  devDependencies: { '@react-native-firebase/app': '^18.0.0' },
}));
assert(run(t5).length === 0, 'Firebase in devDependencies → no suggestions');
teardown(t5);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
