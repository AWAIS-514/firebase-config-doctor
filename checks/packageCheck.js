const fs = require('fs');
const path = require('path');
const { pass, fail } = require('../utils/logger');

const FIREBASE_PACKAGE = '@react-native-firebase/app';

function checkFirebasePackage(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    fail('package.json not found — is this a React Native project?');
    return false;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch {
    fail('package.json is not valid JSON — cannot parse it');
    return false;
  }

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const isInstalled = FIREBASE_PACKAGE in allDeps;

  isInstalled
    ? pass(`Firebase app package (${FIREBASE_PACKAGE}) is installed`)
    : fail(`Firebase app package (${FIREBASE_PACKAGE}) is not installed`);

  return isInstalled;
}

function runPackageCheck(projectPath) {
  const suggestions = [];

  if (!checkFirebasePackage(projectPath)) {
    suggestions.push(`Run: npm install ${FIREBASE_PACKAGE}`);
    suggestions.push('Then follow the React Native Firebase setup guide at rnfirebase.io');
  }

  return suggestions;
}

module.exports = { runPackageCheck };
