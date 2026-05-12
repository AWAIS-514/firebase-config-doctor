const { runIosChecks } = require('../checks/ios');
const { runChecks, makeTest } = require('./helpers');
const { GOOD_PLIST, INFO_WITH_SCHEME, INFO_WITHOUT_SCHEME } = require('./fixtures');

const run = (files) => runChecks(runIosChecks, 'ios', files);
const { test } = makeTest();

// ✅ healthy — plist has all keys, URL scheme is wired in Info.plist
test('healthy → no suggestions',
  run({ 'GoogleService-Info.plist': GOOD_PLIST, 'Info.plist': INFO_WITH_SCHEME }).length === 0);

// ❌ broken — GoogleService-Info.plist is missing entirely
test('missing plist → suggestion',
  run({}).some(s => s.includes('GoogleService-Info.plist')));

// ❌ mismatch — plist is fine but URL scheme not wired in Info.plist
test('URL scheme missing → suggestion',
  run({ 'GoogleService-Info.plist': GOOD_PLIST, 'Info.plist': INFO_WITHOUT_SCHEME }).some(s => s.toLowerCase().includes('url scheme') || s.toLowerCase().includes('cfbundleurlschemes')));
