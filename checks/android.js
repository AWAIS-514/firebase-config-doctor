const fs = require('fs');
const path = require('path');
const { pass, fail } = require('../utils/logger');

const ANDROID_APP_DIR = ['android', 'app'];

function androidPath(projectPath, ...segments) {
  return path.join(projectPath, ...ANDROID_APP_DIR, ...segments);
}

function checkGoogleServicesJson(projectPath) {
  const filePath = androidPath(projectPath, 'google-services.json');
  const exists = fs.existsSync(filePath);

  exists
    ? pass('google-services.json found')
    : fail('google-services.json missing');

  return exists;
}

function checkGoogleServicesPlugin(projectPath) {
  const filePath = androidPath(projectPath, 'build.gradle');

  if (!fs.existsSync(filePath)) {
    fail('android/app/build.gradle not found');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasPlugin = content.includes('com.google.gms.google-services');

  hasPlugin
    ? pass('Google Services plugin found in build.gradle')
    : fail('Google Services plugin missing in build.gradle');

  return hasPlugin;
}

function extractPackageNameFromGoogleServices(filePath) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    fail('google-services.json is not valid JSON — cannot parse it');
    return null;
  }

  const packageName = parsed?.client?.[0]?.client_info?.android_client_info?.package_name;

  if (!packageName) {
    fail('Could not find package_name inside google-services.json');
  }

  return packageName || null;
}

function extractApplicationIdFromGradle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split('\n')) {
    const match = line.trim().match(/^applicationId\s+"([^"]+)"/);
    if (match) return match[1];
  }

  fail('Could not find applicationId in build.gradle');
  return null;
}

function checkPackageNameMatch(projectPath) {
  const googleServicesPath = androidPath(projectPath, 'google-services.json');
  const buildGradlePath    = androidPath(projectPath, 'build.gradle');

  if (!fs.existsSync(googleServicesPath) || !fs.existsSync(buildGradlePath)) {
    fail('Cannot check package name match — one or both files are missing');
    return false;
  }

  const packageName   = extractPackageNameFromGoogleServices(googleServicesPath);
  const applicationId = extractApplicationIdFromGradle(buildGradlePath);

  if (!packageName || !applicationId) return false;

  if (packageName === applicationId) {
    pass('Package name matches between google-services.json and build.gradle');
    return true;
  }

  fail(`Package name mismatch — google-services.json: "${packageName}" vs build.gradle: "${applicationId}"`);
  return false;
}

function runAndroidChecks(projectPath) {
  const suggestions = [];

  if (!checkGoogleServicesJson(projectPath)) {
    suggestions.push('Add android/app/google-services.json — download it from the Firebase Console');
  }

  if (!checkGoogleServicesPlugin(projectPath)) {
    suggestions.push('Add "apply plugin: com.google.gms.google-services" to android/app/build.gradle');
  }

  if (!checkPackageNameMatch(projectPath)) {
    suggestions.push('Make sure applicationId in build.gradle matches package_name in google-services.json');
  }

  return suggestions;
}

module.exports = { runAndroidChecks };
