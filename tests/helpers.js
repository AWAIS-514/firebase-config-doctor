const fs = require('fs');
const os = require('os');
const path = require('path');

// Creates a temp folder, writes files into it, runs checkFn, cleans up.
// subDir: subfolder inside the temp dir to write files into (e.g. 'android/app', 'ios')
// files:  { filename: content } — pass {} for no files
function runChecks(checkFn, subDir, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));

  const origWrite = process.stdout.write.bind(process.stdout);
  try {
    const target = path.join(dir, subDir || '');
    fs.mkdirSync(target, { recursive: true });

    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(target, name), content);
    }

    process.stdout.write = () => true;
    return checkFn(dir);
  } finally {
    process.stdout.write = origWrite;
    // fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Prints PASS/FAIL and tracks counts.
function makeTest() {
  let passed = 0, failed = 0;

  function test(label, ok) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'}: ${label}`);
    ok ? passed++ : failed++;
  }

  return { test };
}

module.exports = { runChecks, makeTest };
