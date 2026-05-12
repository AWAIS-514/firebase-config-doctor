const fs = require('fs');
const path = require('path');
const os = require('os');
const { runAndroidChecks } = require('../checks/android');

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-android-'));
  fs.mkdirSync(path.join(dir, 'android', 'app'), { recursive: true });
  return dir;
}

function teardown(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function run(dir) {
  const orig = console.log;
  console.log = () => {};
  const result = runAndroidChecks(dir);
  console.log = orig;
  return result;
}

function writeGoogleServices(dir, packageName) {
  const data = { client: [{ client_info: { android_client_info: { package_name: packageName } } }] };
  fs.writeFileSync(path.join(dir, 'android', 'app', 'google-services.json'), JSON.stringify(data));
}

function writeGradle(dir, { applicationId = 'com.example.app', plugin = true } = {}) {
  const content = [
    `applicationId "${applicationId}"`,
    plugin ? "apply plugin: 'com.google.gms.google-services'" : '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'android', 'app', 'build.gradle'), content);
}

let passed = 0, failed = 0;
function assert(condition, name) {
  if (condition) { console.log(`  PASS: ${name}`); passed++; }
  else           { console.log(`  FAIL: ${name}`); failed++; }
}

// healthy setup → no suggestions
const t1 = setup();
writeGoogleServices(t1, 'com.example.app');
writeGradle(t1);
assert(run(t1).length === 0, 'healthy Android config → no suggestions');
teardown(t1);

// missing google-services.json
const t2 = setup();
writeGradle(t2);
assert(run(t2).some(s => s.includes('google-services.json')), 'missing google-services.json → suggestion');
teardown(t2);

// malformed google-services.json
const t3 = setup();
fs.writeFileSync(path.join(t3, 'android', 'app', 'google-services.json'), '{ bad json }');
writeGradle(t3);
assert(run(t3).some(s => s.toLowerCase().includes('match') || s.toLowerCase().includes('applicationid')),
  'malformed google-services.json → package-match suggestion');
teardown(t3);

// package name mismatch
const t4 = setup();
writeGoogleServices(t4, 'com.correct.app');
writeGradle(t4, { applicationId: 'com.wrong.app' });
assert(run(t4).some(s => s.toLowerCase().includes('match') || s.toLowerCase().includes('applicationid')),
  'package name mismatch → suggestion');
teardown(t4);

// missing Gradle plugin
const t5 = setup();
writeGoogleServices(t5, 'com.example.app');
writeGradle(t5, { plugin: false });
assert(run(t5).some(s => s.toLowerCase().includes('plugin')), 'missing Gradle plugin → suggestion');
teardown(t5);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
