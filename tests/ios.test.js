// ios.test.js
// Simple unit tests for the iOS checks.
// We create fake temporary project folders to test each scenario.
//
// Run with: node tests/ios.test.js

const fs = require('fs');
const path = require('path');
const os = require('os');

const { runIosChecks } = require('../checks/ios');

// -------------------------------------------------------------------
// Test helpers
// -------------------------------------------------------------------

function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-ios-test-'));
  fs.mkdirSync(path.join(tmpDir, 'ios'), { recursive: true });
  return tmpDir;
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

// A complete, valid GoogleService-Info.plist with all required keys
// The reversed client ID uses a fake value — no real credentials.
const VALID_REVERSED_CLIENT_ID = 'com.googleusercontent.apps.12345-abcde';
const VALID_GOOGLE_SERVICE_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>GOOGLE_APP_ID</key>
  <string>1:12345:ios:abcdef</string>
  <key>GCM_SENDER_ID</key>
  <string>12345</string>
  <key>BUNDLE_ID</key>
  <string>com.example.app</string>
  <key>API_KEY</key>
  <string>FAKE_API_KEY</string>
  <key>REVERSED_CLIENT_ID</key>
  <string>${VALID_REVERSED_CLIENT_ID}</string>
</dict>
</plist>`;

// A valid Info.plist that includes the URL scheme
const VALID_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>${VALID_REVERSED_CLIENT_ID}</string>
      </array>
    </dict>
  </array>
</dict>
</plist>`;

// -------------------------------------------------------------------
// Test 1: Missing GoogleService-Info.plist → should return a suggestion
// -------------------------------------------------------------------
function testMissingPlist() {
  console.log('\nTest: Missing GoogleService-Info.plist');

  const tmpDir = createTempProject();

  const suggestions = silenceLogs(() => runIosChecks(tmpDir));

  assert(
    suggestions.some(s => s.includes('GoogleService-Info.plist')),
    'Suggestion mentions GoogleService-Info.plist'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 2: Plist exists but is missing required keys → should fail key check
// -------------------------------------------------------------------
function testMissingRequiredKeys() {
  console.log('\nTest: GoogleService-Info.plist missing required keys');

  const tmpDir = createTempProject();

  // Write a plist that only has REVERSED_CLIENT_ID — missing GOOGLE_APP_ID etc.
  const incompletePlist = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>REVERSED_CLIENT_ID</key>
  <string>${VALID_REVERSED_CLIENT_ID}</string>
</dict>
</plist>`;
  fs.writeFileSync(path.join(tmpDir, 'ios', 'GoogleService-Info.plist'), incompletePlist);
  fs.writeFileSync(path.join(tmpDir, 'ios', 'Info.plist'), VALID_INFO_PLIST);

  const suggestions = silenceLogs(() => runIosChecks(tmpDir));

  assert(
    suggestions.some(s => s.toLowerCase().includes('firebase console') || s.toLowerCase().includes('required keys')),
    'Suggestion mentions re-downloading plist due to missing keys'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 3: Missing URL scheme in Info.plist → should return a suggestion
// -------------------------------------------------------------------
function testMissingUrlScheme() {
  console.log('\nTest: URL scheme missing in Info.plist');

  const tmpDir = createTempProject();

  // Valid GoogleService-Info.plist with all required keys
  fs.writeFileSync(path.join(tmpDir, 'ios', 'GoogleService-Info.plist'), VALID_GOOGLE_SERVICE_PLIST);

  // Info.plist WITHOUT the reversed client ID scheme
  const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>CFBundleIdentifier</key>
  <string>com.example.app</string>
</dict>
</plist>`;
  fs.writeFileSync(path.join(tmpDir, 'ios', 'Info.plist'), infoPlistContent);

  const suggestions = silenceLogs(() => runIosChecks(tmpDir));

  assert(
    suggestions.some(s => s.toLowerCase().includes('url scheme') || s.toLowerCase().includes('cfbundleurlschemes')),
    'Suggestion mentions URL scheme or CFBundleURLSchemes'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 4: Everything correct → should return no suggestions
// -------------------------------------------------------------------
function testAllIosChecksPassing() {
  console.log('\nTest: All iOS checks pass with valid setup');

  const tmpDir = createTempProject();

  fs.writeFileSync(path.join(tmpDir, 'ios', 'GoogleService-Info.plist'), VALID_GOOGLE_SERVICE_PLIST);
  fs.writeFileSync(path.join(tmpDir, 'ios', 'Info.plist'), VALID_INFO_PLIST);

  const suggestions = silenceLogs(() => runIosChecks(tmpDir));

  assert(suggestions.length === 0, 'No suggestions when everything is correct');

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Run all tests
// -------------------------------------------------------------------
console.log('Running iOS checks tests...');

testMissingPlist();
testMissingRequiredKeys();
testMissingUrlScheme();
testAllIosChecksPassing();

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
