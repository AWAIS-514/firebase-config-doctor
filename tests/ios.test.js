const fs = require('fs');
const path = require('path');
const os = require('os');
const { runIosChecks } = require('../checks/ios');

const REVERSED_CLIENT_ID = 'com.googleusercontent.apps.12345-abcde';

const FULL_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>GOOGLE_APP_ID</key>
  <string>1:12345:ios:abcdef</string>
  <key>GCM_SENDER_ID</key>
  <string>12345</string>
  <key>BUNDLE_ID</key>
  <string>com.example.app</string>
  <key>API_KEY</key>
  <string>FAKE_KEY</string>
  <key>REVERSED_CLIENT_ID</key>
  <string>${REVERSED_CLIENT_ID}</string>
</dict>
</plist>`;

const INFO_WITH_SCHEME = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>CFBundleURLTypes</key><array><dict>
    <key>CFBundleURLSchemes</key><array>
      <string>${REVERSED_CLIENT_ID}</string>
    </array>
  </dict></array>
</dict></plist>`;

const INFO_WITHOUT_SCHEME = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>com.example.app</string>
</dict></plist>`;

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-ios-'));
  fs.mkdirSync(path.join(dir, 'ios'), { recursive: true });
  return dir;
}

function teardown(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function run(dir) {
  const orig = console.log;
  console.log = () => {};
  const result = runIosChecks(dir);
  console.log = orig;
  return result;
}

function write(dir, file, content) {
  fs.writeFileSync(path.join(dir, 'ios', file), content);
}

let passed = 0, failed = 0;
function assert(condition, name) {
  if (condition) { console.log(`  PASS: ${name}`); passed++; }
  else           { console.log(`  FAIL: ${name}`); failed++; }
}

// healthy setup → no suggestions
const t1 = setup();
write(t1, 'GoogleService-Info.plist', FULL_PLIST);
write(t1, 'Info.plist', INFO_WITH_SCHEME);
assert(run(t1).length === 0, 'healthy iOS config → no suggestions');
teardown(t1);

// missing GoogleService-Info.plist
const t2 = setup();
assert(run(t2).some(s => s.includes('GoogleService-Info.plist')), 'missing plist → suggestion');
teardown(t2);

// plist exists but missing required keys
const t3 = setup();
write(t3, 'GoogleService-Info.plist', `<plist>
<dict>
  <key>REVERSED_CLIENT_ID</key>
  <string>${REVERSED_CLIENT_ID}</string>
</dict>
</plist>`);
write(t3, 'Info.plist', INFO_WITH_SCHEME);
assert(run(t3).some(s => s.toLowerCase().includes('firebase console') || s.toLowerCase().includes('required keys')),
  'missing required plist keys → suggestion');
teardown(t3);

// URL scheme missing in Info.plist
const t4 = setup();
write(t4, 'GoogleService-Info.plist', FULL_PLIST);
write(t4, 'Info.plist', INFO_WITHOUT_SCHEME);
assert(run(t4).some(s => s.toLowerCase().includes('url scheme') || s.toLowerCase().includes('cfbundleurlschemes')),
  'missing URL scheme → suggestion');
teardown(t4);

// Info.plist itself missing
const t5 = setup();
write(t5, 'GoogleService-Info.plist', FULL_PLIST);
assert(run(t5).some(s => s.toLowerCase().includes('url scheme') || s.toLowerCase().includes('cfbundleurlschemes')),
  'missing Info.plist → URL scheme suggestion');
teardown(t5);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
