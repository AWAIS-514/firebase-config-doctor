const fs = require('fs');
const path = require('path');

const { header, suggestions } = require('./utils/logger');
const { runAndroidChecks } = require('./checks/android');
const { runIosChecks } = require('./checks/ios');
const { runPackageCheck } = require('./checks/packageCheck');

function getProjectPath() {
  const args = process.argv.slice(2);
  const flagIndex = args.indexOf('--project');
  return flagIndex !== -1 ? args[flagIndex + 1] : args[0];
}

function validateProjectPath(projectPath) {
  if (!projectPath) {
    console.log('Usage: node firebase-config-doctor.js <path-to-project>');
    process.exit(1);
  }

  const absolutePath = path.resolve(projectPath);

  console.log(`Checking project at: ${absolutePath}`);

  if (!fs.existsSync(absolutePath)) {
    console.log(`Error: Project folder not found: ${absolutePath}`);
    process.exit(1);
  }

  return absolutePath;
}

function runAllChecks(projectPath) {
  header('Android Checks');
  const androidSuggestions = runAndroidChecks(projectPath);

  header('iOS Checks');
  const iosSuggestions = runIosChecks(projectPath);

  header('React Native Firebase');
  const packageSuggestions = runPackageCheck(projectPath);

  return [...androidSuggestions, ...iosSuggestions, ...packageSuggestions];
}

const projectPath = validateProjectPath(getProjectPath());

console.log(`\n Firebase Config Doctor\n Checking project at: ${projectPath}\n`);

const allSuggestions = runAllChecks(projectPath);
suggestions(allSuggestions);

console.log('');
