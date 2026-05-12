const { runPackageCheck } = require('../checks/packageCheck');
const { runChecks, makeTest } = require('./helpers');
const { PKG_WITH_FIREBASE, PKG_WITHOUT_FIREBASE } = require('./fixtures');

const run = (content) => runChecks(runPackageCheck, null, content ? { 'package.json': content } : {});
const { test } = makeTest();

// ✅ healthy — Firebase is listed in dependencies
test('healthy → no suggestions',
  run(PKG_WITH_FIREBASE).length === 0);

// ❌ broken — package.json exists but Firebase is not listed
test('Firebase missing → install suggestion',
  run(PKG_WITHOUT_FIREBASE).some(s => s.includes('@react-native-firebase/app')));

// ❌ broken — no package.json file at all
test('no package.json → suggestion',
  run(null).length > 0);
