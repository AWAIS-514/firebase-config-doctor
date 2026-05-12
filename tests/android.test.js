const { runAndroidChecks } = require('../checks/android');
const { runChecks, makeTest } = require('./helpers');
const { GOOD_JSON, GOOD_GRADLE, BAD_GRADLE } = require('./fixtures');

const run = (files) => runChecks(runAndroidChecks, 'android/app', files);
const { test } = makeTest();

// ✅ healthy — both files correct, IDs match, plugin present
test('healthy → no suggestions', run({ 'google-services.json': GOOD_JSON, 'build.gradle': GOOD_GRADLE }).length === 0);

// ❌ broken — google-services.json is missing entirely
test('missing file → suggestion', run({ 'build.gradle': GOOD_GRADLE }).some(s => s.includes('google-services.json')));

// ❌ mismatch — package name in JSON does not match applicationId in gradle
test('package name mismatch → suggestion', run({ 'google-services.json': GOOD_JSON, 'build.gradle': BAD_GRADLE }).some(s => s.toLowerCase().includes('applicationid') || s.toLowerCase().includes('match')));

