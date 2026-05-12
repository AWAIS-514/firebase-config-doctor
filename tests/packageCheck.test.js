// packageCheck.test.js
// Simple unit tests for the package.json Firebase check.
//
// Run with: node tests/packageCheck.test.js

const fs = require('fs');
const path = require('path');
const os = require('os');

const { runPackageCheck } = require('../checks/packageCheck');

// -------------------------------------------------------------------
// Test helpers
// -------------------------------------------------------------------

function createTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rn-pkg-test-'));
}

function removeTempProject(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  FAIL: ${testName}`);
    failed++;
  }
}

function silenceLogs(fn) {
  const original = console.log;
  console.log = () => {};
  const result = fn();
  console.log = original;
  return result;
}

// -------------------------------------------------------------------
// Test 1: Missing package.json → should return a suggestion
// -------------------------------------------------------------------
function testMissingPackageJson() {
  console.log('\nTest: Missing package.json');

  const tmpDir = createTempProject();

  // No package.json created

  const suggestions = silenceLogs(() => runPackageCheck(tmpDir));

  assert(
    suggestions.length > 0,
    'Returns at least one suggestion when package.json is missing'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 2: Malformed package.json → should return a suggestion
// -------------------------------------------------------------------
function testMalformedPackageJson() {
  console.log('\nTest: Malformed package.json');

  const tmpDir = createTempProject();

  // Write invalid JSON
  fs.writeFileSync(path.join(tmpDir, 'package.json'), '{ this is not json }');

  const suggestions = silenceLogs(() => runPackageCheck(tmpDir));

  assert(
    suggestions.length > 0,
    'Returns a suggestion when package.json cannot be parsed'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 3: Firebase package missing → should return install suggestion
// -------------------------------------------------------------------
function testFirebasePackageMissing() {
  console.log('\nTest: Firebase package not in package.json');

  const tmpDir = createTempProject();

  // Valid package.json but no Firebase dependency
  const packageJson = {
    name: 'my-app',
    version: '1.0.0',
    dependencies: {
      react: '18.0.0',
      'react-native': '0.72.0',
    },
  };
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const suggestions = silenceLogs(() => runPackageCheck(tmpDir));

  assert(
    suggestions.some(s => s.includes('@react-native-firebase/app')),
    'Suggestion mentions @react-native-firebase/app'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 4: Firebase package present → should return no suggestions
// -------------------------------------------------------------------
function testFirebasePackagePresent() {
  console.log('\nTest: Firebase package is correctly installed');

  const tmpDir = createTempProject();

  const packageJson = {
    name: 'my-app',
    version: '1.0.0',
    dependencies: {
      react: '18.0.0',
      'react-native': '0.72.0',
      '@react-native-firebase/app': '^18.0.0',
    },
  };
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const suggestions = silenceLogs(() => runPackageCheck(tmpDir));

  assert(suggestions.length === 0, 'No suggestions when Firebase is installed');

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Run all tests
// -------------------------------------------------------------------
console.log('Running package check tests...');

testMissingPackageJson();
testMalformedPackageJson();
testFirebasePackageMissing();
testFirebasePackagePresent();

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
