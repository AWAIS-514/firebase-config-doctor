const fs = require('fs');
const path = require('path');
const { pass, fail } = require('../utils/logger');

const GOOGLE_SERVICE_PLIST = ['ios', 'GoogleService-Info.plist'];
const INFO_PLIST           = ['ios', 'Info.plist'];

function iosPath(projectPath, ...segments) {
  return path.join(projectPath, ...segments);
}

// Extracts a <string> value that follows a matching <key> in plist XML.
function readPlistValue(content, key) {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== `<key>${key}</key>`) continue;

    const nextLine = lines[i + 1]?.trim();
    const match = nextLine?.match(/<string>(.+?)<\/string>/);
    if (match) return match[1];
  }

  return null;
}

function checkGoogleServiceInfoPlist(projectPath) {
  const filePath = iosPath(projectPath, ...GOOGLE_SERVICE_PLIST);
  const exists = fs.existsSync(filePath);

  exists
    ? pass('GoogleService-Info.plist found')
    : fail('GoogleService-Info.plist missing');

  return exists;
}

function checkRequiredPlistKeys(projectPath) {
  const filePath = iosPath(projectPath, ...GOOGLE_SERVICE_PLIST);

  if (!fs.existsSync(filePath)) {
    fail('Cannot check required keys — GoogleService-Info.plist is missing');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const requiredKeys = ['GOOGLE_APP_ID', 'GCM_SENDER_ID', 'BUNDLE_ID', 'API_KEY'];
  const missingKeys = requiredKeys.filter(key => !content.includes(`<key>${key}</key>`));

  if (missingKeys.length === 0) {
    pass('GoogleService-Info.plist contains all required keys');
    return true;
  }

  fail(`GoogleService-Info.plist is missing required keys: ${missingKeys.join(', ')}`);
  return false;
}

function checkUrlScheme(projectPath) {
  const googleServicePath = iosPath(projectPath, ...GOOGLE_SERVICE_PLIST);
  const infoPlistPath     = iosPath(projectPath, ...INFO_PLIST);

  if (!fs.existsSync(googleServicePath)) {
    fail('Cannot check URL scheme — GoogleService-Info.plist is missing');
    return false;
  }

  if (!fs.existsSync(infoPlistPath)) {
    fail('ios/Info.plist not found — cannot check URL scheme');
    return false;
  }

  const reversedClientId = readPlistValue(
    fs.readFileSync(googleServicePath, 'utf8'),
    'REVERSED_CLIENT_ID'
  );

  if (!reversedClientId) {
    fail('REVERSED_CLIENT_ID not found in GoogleService-Info.plist');
    return false;
  }

  const infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
  const hasScheme = infoPlistContent.includes(reversedClientId);

  if (hasScheme) {
    // Redact to avoid printing the full OAuth client ID in terminal output.
    const redacted = reversedClientId.replace(/(com\.googleusercontent\.apps\.\d+).*/, '$1-…');
    pass(`URL scheme registered in Info.plist (${redacted})`);
    return true;
  }

  fail('URL scheme missing in Info.plist — add REVERSED_CLIENT_ID value under CFBundleURLSchemes');
  return false;
}

function runIosChecks(projectPath) {
  const suggestions = [];

  if (!checkGoogleServiceInfoPlist(projectPath)) {
    suggestions.push('Add ios/GoogleService-Info.plist — download it from the Firebase Console');
  }

  if (!checkRequiredPlistKeys(projectPath)) {
    suggestions.push('Re-download GoogleService-Info.plist from the Firebase Console — required keys are missing');
  }

  if (!checkUrlScheme(projectPath)) {
    suggestions.push('Add the REVERSED_CLIENT_ID value as a URL scheme in ios/Info.plist under CFBundleURLSchemes');
  }

  return suggestions;
}

module.exports = { runIosChecks };
