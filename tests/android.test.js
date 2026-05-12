// android.test.js
// Simple unit tests for the Android checks.
// We create fake temporary project folders to test each scenario.
//
// Run with: node tests/android.test.js

const fs = require('fs');
const path = require('path');
const os = require('os');

// We test the internal check functions directly by requiring the module.
// Since those functions log to the console, we silence them during tests.
const { runAndroidChecks } = require('../checks/android');

// -------------------------------------------------------------------
// Test helpers
// -------------------------------------------------------------------

// Create a temporary directory that mimics a React Native project
function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-test-'));
  fs.mkdirSync(path.join(tmpDir, 'android', 'app'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'ios'), { recursive: true });
  return tmpDir;
}

// Clean up the temporary directory after a test
function removeTempProject(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Simple assert helper — prints PASS or FAIL
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

// Silence console.log during checks so test output stays clean
function silenceLogs(fn) {
  const original = console.log;
  console.log = () => {};
  const result = fn();
  console.log = original;
  return result;
}

// -------------------------------------------------------------------
// Test 1: Missing google-services.json → should return a suggestion
// -------------------------------------------------------------------
function testMissingGoogleServicesJson() {
  console.log('\nTest: Missing google-services.json');

  const tmpDir = createTempProject();

  // No google-services.json created — should fail

  const suggestions = silenceLogs(() => runAndroidChecks(tmpDir));

  assert(
    suggestions.some(s => s.includes('google-services.json')),
    'Suggestion mentions google-services.json'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 2: Malformed google-services.json → should return a suggestion
// -------------------------------------------------------------------
function testMalformedGoogleServicesJson() {
  console.log('\nTest: Malformed google-services.json');

  const tmpDir = createTempProject();

  // Write invalid JSON to google-services.json
  const filePath = path.join(tmpDir, 'android', 'app', 'google-services.json');
  fs.writeFileSync(filePath, 'this is not valid json }{');

  // Also write a build.gradle so the package check can run
  const gradlePath = path.join(tmpDir, 'android', 'app', 'build.gradle');
  fs.writeFileSync(gradlePath, 'applicationId "com.example.app"');

  const suggestions = silenceLogs(() => runAndroidChecks(tmpDir));

  assert(
    suggestions.some(s => s.toLowerCase().includes('package') || s.toLowerCase().includes('match')),
    'Suggestion mentions package name issue due to parse failure'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 3: Package name mismatch → should return a suggestion
// -------------------------------------------------------------------
function testPackageNameMismatch() {
  console.log('\nTest: Package name mismatch between google-services.json and build.gradle');

  const tmpDir = createTempProject();

  // google-services.json has one package name
  const googleServices = {
    client: [
      {
        client_info: {
          android_client_info: {
            package_name: 'com.correct.app',
          },
        },
      },
    ],
  };
  const googleServicesPath = path.join(tmpDir, 'android', 'app', 'google-services.json');
  fs.writeFileSync(googleServicesPath, JSON.stringify(googleServices, null, 2));

  // build.gradle has a DIFFERENT package name — this is the mismatch
  const gradleContent = `
    android {
        defaultConfig {
            applicationId "com.wrong.app"
        }
    }
    apply plugin: 'com.google.gms.google-services'
  `;
  const gradlePath = path.join(tmpDir, 'android', 'app', 'build.gradle');
  fs.writeFileSync(gradlePath, gradleContent);

  const suggestions = silenceLogs(() => runAndroidChecks(tmpDir));

  assert(
    suggestions.some(s => s.toLowerCase().includes('applicationid') || s.toLowerCase().includes('match')),
    'Suggestion mentions applicationId or mismatch'
  );

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Test 4: Everything correct → should return no suggestions
// -------------------------------------------------------------------
function testAllAndroidChecksPassing() {
  console.log('\nTest: All Android checks pass with valid setup');

  const tmpDir = createTempProject();

  // Create a valid google-services.json
  const googleServices = {
    client: [
      {
        client_info: {
          android_client_info: {
            package_name: 'com.example.app',
          },
        },
      },
    ],
  };
  const googleServicesPath = path.join(tmpDir, 'android', 'app', 'google-services.json');
  fs.writeFileSync(googleServicesPath, JSON.stringify(googleServices, null, 2));

  // Create a valid build.gradle with matching applicationId and plugin
  const gradleContent = `
    android {
        defaultConfig {
            applicationId "com.example.app"
        }
    }
    apply plugin: 'com.google.gms.google-services'
  `;
  const gradlePath = path.join(tmpDir, 'android', 'app', 'build.gradle');
  fs.writeFileSync(gradlePath, gradleContent);

  const suggestions = silenceLogs(() => runAndroidChecks(tmpDir));

  assert(suggestions.length === 0, 'No suggestions when everything is correct');

  removeTempProject(tmpDir);
}

// -------------------------------------------------------------------
// Run all tests
// -------------------------------------------------------------------
console.log('Running Android checks tests...');

testMissingGoogleServicesJson();
testMalformedGoogleServicesJson();
testPackageNameMismatch();
testAllAndroidChecksPassing();

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
