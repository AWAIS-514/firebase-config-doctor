// generate-docs.js
// Writes the project documentation as a self-contained HTML file,
// then converts it to PDF using Chrome headless.
// Run: node generate-docs.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Firebase Config Doctor — Complete Project Documentation</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.7;
    color: #1a1a2e;
    background: #ffffff;
    padding: 48px 56px;
    max-width: 960px;
    margin: 0 auto;
  }
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #0f3460;
    border-bottom: 4px solid #e94560;
    padding-bottom: 10px;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 13px;
    color: #555;
    margin-bottom: 36px;
  }
  h2 {
    font-size: 19px;
    font-weight: 700;
    color: #0f3460;
    margin-top: 42px;
    margin-bottom: 10px;
    border-left: 5px solid #e94560;
    padding-left: 12px;
  }
  h3 {
    font-size: 15px;
    font-weight: 700;
    color: #16213e;
    margin-top: 26px;
    margin-bottom: 8px;
  }
  h4 {
    font-size: 13px;
    font-weight: 700;
    color: #0f3460;
    margin-top: 18px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  p { margin-bottom: 10px; }
  ul { margin: 8px 0 12px 22px; }
  li { margin-bottom: 4px; }
  code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f0f4ff;
    border: 1px solid #d0d8f0;
    border-radius: 3px;
    padding: 1px 5px;
    color: #c0392b;
  }
  pre {
    background: #1a1a2e;
    color: #e8e8f0;
    font-family: 'Courier New', monospace;
    font-size: 11.5px;
    line-height: 1.6;
    padding: 16px 18px;
    border-radius: 6px;
    margin: 12px 0 16px 0;
    overflow-x: auto;
    border-left: 4px solid #e94560;
    page-break-inside: avoid;
  }
  pre .ln { color: #555a7a; user-select: none; margin-right: 14px; }
  pre .kw { color: #c792ea; }
  pre .str { color: #c3e88d; }
  pre .cm { color: #546e7a; font-style: italic; }
  pre .fn { color: #82aaff; }
  pre .var { color: #f78c6c; }
  pre .num { color: #f78c6c; }
  pre .op  { color: #89ddff; }
  .file-header {
    background: #0f3460;
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: bold;
    padding: 7px 16px;
    border-radius: 6px 6px 0 0;
    margin-top: 18px;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .file-header + pre {
    border-radius: 0 0 6px 6px;
    margin-top: 0;
  }
  .call-box {
    background: #f8f9ff;
    border: 1px solid #c8d0f0;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 14px 0;
    page-break-inside: avoid;
  }
  .call-box h4 { margin-top: 0; color: #0f3460; }
  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    margin-right: 6px;
    vertical-align: middle;
  }
  .badge-pass { background: #d4f5e2; color: #1a6636; }
  .badge-fail { background: #fde8e8; color: #a01010; }
  .badge-note { background: #fff3cd; color: #856404; }
  .flow-diagram {
    background: #f8f9ff;
    border: 1px solid #c8d0f0;
    border-radius: 8px;
    padding: 20px 24px;
    margin: 18px 0;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 2;
    page-break-inside: avoid;
  }
  .flow-diagram .arrow { color: #e94560; font-weight: bold; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 18px 0;
    font-size: 12px;
    page-break-inside: avoid;
  }
  th {
    background: #0f3460;
    color: #fff;
    padding: 8px 12px;
    text-align: left;
    font-weight: 600;
  }
  td {
    padding: 7px 12px;
    border-bottom: 1px solid #e8eaf0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f5f7ff; }
  .toc { margin: 24px 0 36px 0; }
  .toc li { list-style: none; padding: 2px 0; }
  .toc a { color: #0f3460; text-decoration: none; }
  .toc .toc-section { font-weight: bold; margin-top: 6px; }
  .page-break { page-break-after: always; }
  .highlight-line {
    background: rgba(233,69,96,0.12);
    display: block;
    margin: 0 -18px;
    padding: 0 18px;
  }
  .summary-box {
    background: #e8f4fd;
    border-left: 5px solid #0f3460;
    border-radius: 0 6px 6px 0;
    padding: 14px 18px;
    margin: 14px 0 20px 0;
  }
</style>
</head>
<body>

<h1>Firebase Config Doctor</h1>
<div class="subtitle">Complete Project Documentation &nbsp;·&nbsp; Code walkthrough, function call graph, and line-by-line explanation</div>

<!-- TABLE OF CONTENTS -->
<h2>Table of Contents</h2>
<ul class="toc">
  <li class="toc-section">1. Project Overview</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;1.1 What the tool does</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;1.2 Folder structure</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;1.3 End-to-end execution flow</li>
  <li class="toc-section">2. File: utils/logger.js</li>
  <li class="toc-section">3. File: firebase-config-doctor.js (entry point)</li>
  <li class="toc-section">4. File: checks/android.js</li>
  <li class="toc-section">5. File: checks/ios.js</li>
  <li class="toc-section">6. File: checks/packageCheck.js</li>
  <li class="toc-section">7. Function Call Graph</li>
  <li class="toc-section">8. Tests walkthrough</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;8.1 tests/android.test.js</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;8.2 tests/ios.test.js</li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;8.3 tests/packageCheck.test.js</li>
  <li class="toc-section">9. How to run</li>
</ul>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>1. Project Overview</h2>

<h3>1.1 What the tool does</h3>
<p>
  Firebase Config Doctor is a zero-dependency Node.js CLI tool. Given a path to a React Native
  project on disk, it reads configuration files and reports whether Firebase is wired up correctly
  for both Android and iOS. It never runs a build — it is a pure static analysis tool. It prints
  green checkmarks for things that are correct and red X marks for problems, then prints a
  consolidated action list at the end.
</p>
<p>The tool catches the six most common Firebase setup mistakes before a developer sees a cryptic
  Gradle error, Xcode build failure, or runtime Firebase initialization crash:</p>
<ul>
  <li>Missing <code>android/app/google-services.json</code></li>
  <li>Missing Google Services Gradle plugin in <code>android/app/build.gradle</code></li>
  <li>Package name mismatch between <code>google-services.json</code> and <code>build.gradle</code></li>
  <li>Missing <code>ios/GoogleService-Info.plist</code></li>
  <li>Incomplete <code>GoogleService-Info.plist</code> (missing required keys)</li>
  <li>Missing REVERSED_CLIENT_ID URL scheme in <code>ios/Info.plist</code></li>
  <li>Missing <code>@react-native-firebase/app</code> npm package</li>
</ul>

<h3>1.2 Folder structure</h3>
<pre>
firebase-config-doctor/
├── firebase-config-doctor.js   <span class="cm">← CLI entry point — reads args, runs all checks</span>
├── package.json                <span class="cm">← enables npm run firebase-config-doctor</span>
├── checks/
│   ├── android.js              <span class="cm">← 3 Android checks</span>
│   ├── ios.js                  <span class="cm">← 3 iOS checks</span>
│   └── packageCheck.js         <span class="cm">← 1 npm package check</span>
├── utils/
│   └── logger.js               <span class="cm">← coloured terminal output helpers</span>
├── tests/
│   ├── android.test.js         <span class="cm">← 4 Android unit tests</span>
│   ├── ios.test.js             <span class="cm">← 4 iOS unit tests</span>
│   └── packageCheck.test.js    <span class="cm">← 4 package unit tests</span>
└── dummy-rn-app/               <span class="cm">← example project for manual testing</span>
    ├── android/app/
    │   ├── google-services.json
    │   └── build.gradle
    ├── ios/
    │   ├── GoogleService-Info.plist
    │   └── Info.plist
    └── package.json
</pre>

<h3>1.3 End-to-end execution flow</h3>
<div class="flow-diagram">
  <b>User runs:</b> node firebase-config-doctor.js ./my-app<br><br>
  firebase-config-doctor.js<br>
  &nbsp;&nbsp;<span class="arrow">→</span> parse CLI args → resolve absolute path → validate folder exists<br>
  &nbsp;&nbsp;<span class="arrow">→</span> header("Android Checks")<br>
  &nbsp;&nbsp;<span class="arrow">→</span> runAndroidChecks(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[checks/android.js]</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkGoogleServicesJson(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkGoogleServicesPlugin(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkPackageNameMatch(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">←</span> returns [ ...suggestion strings ]<br>
  &nbsp;&nbsp;<span class="arrow">→</span> header("iOS Checks")<br>
  &nbsp;&nbsp;<span class="arrow">→</span> runIosChecks(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[checks/ios.js]</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkGoogleServiceInfoPlist(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkRequiredPlistKeys(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkUrlScheme(path)<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> readPlistValue(content, "REVERSED_CLIENT_ID")<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">←</span> returns value string<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">←</span> returns [ ...suggestion strings ]<br>
  &nbsp;&nbsp;<span class="arrow">→</span> header("React Native Firebase")<br>
  &nbsp;&nbsp;<span class="arrow">→</span> runPackageCheck(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[checks/packageCheck.js]</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">→</span> checkFirebasePackage(path) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>→ pass() or fail()</b><br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="arrow">←</span> returns [ ...suggestion strings ]<br>
  &nbsp;&nbsp;<span class="arrow">→</span> suggestions([...all]) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[utils/logger.js]</b><br>
  &nbsp;&nbsp;<span class="arrow">→</span> process exits
</div>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>2. File: utils/logger.js</h2>

<div class="summary-box">
  <b>Purpose:</b> The single place where all terminal output is formatted and coloured.
  Every other file imports <code>pass()</code> and <code>fail()</code> from here.
  Nothing else is allowed to call <code>console.log</code> for result output.
</div>

<div class="file-header">📄 utils/logger.js</div>
<pre>
<span class="ln"> 1</span><span class="cm">// ANSI escape codes recognised by every modern terminal</span>
<span class="ln"> 2</span><span class="kw">const</span> <span class="var">GREEN</span>  = <span class="str">'\x1b[32m'</span>;   <span class="cm">// green  — used for ✓ (pass)</span>
<span class="ln"> 3</span><span class="kw">const</span> <span class="var">RED</span>    = <span class="str">'\x1b[31m'</span>;   <span class="cm">// red    — used for ✗ (fail)</span>
<span class="ln"> 4</span><span class="kw">const</span> <span class="var">YELLOW</span> = <span class="str">'\x1b[33m'</span>;   <span class="cm">// yellow — used for section headers and suggestions</span>
<span class="ln"> 5</span><span class="kw">const</span> <span class="var">RESET</span>  = <span class="str">'\x1b[0m'</span>;    <span class="cm">// resets ALL colour back to the terminal default</span>
</pre>

<p><b>Why ANSI codes?</b> These are single-byte escape sequences that terminals interpret as
colour-switch instructions. <code>\x1b[32m</code> means "switch foreground to green", and
<code>\x1b[0m</code> means "reset all attributes". Wrapping only the symbol (✓ or ✗) and
not the message keeps the text clean and readable.</p>

<pre>
<span class="ln"> 7</span><span class="kw">function</span> <span class="fn">pass</span>(message) {
<span class="ln"> 8</span>  console.<span class="fn">log</span>(<span class="str">\`\${GREEN}✓\${RESET} \${message}\`</span>);
<span class="ln"> 9</span>}
</pre>
<p>Prints: <code style="color:green">✓</code> followed by the message in default colour.
The template literal <code>\`\${GREEN}✓\${RESET} \${message}\`</code> builds one string:
the green escape sequence, the checkmark character, the reset sequence, a space, then the message.</p>

<pre>
<span class="ln">11</span><span class="kw">function</span> <span class="fn">fail</span>(message) {
<span class="ln">12</span>  console.<span class="fn">log</span>(<span class="str">\`\${RED}✗\${RESET} \${message}\`</span>);
<span class="ln">13</span>}
</pre>
<p>Identical pattern to <code>pass()</code> but uses red and the ✗ character.</p>

<pre>
<span class="ln">15</span><span class="kw">function</span> <span class="fn">header</span>(title) {
<span class="ln">16</span>  console.<span class="fn">log</span>(<span class="str">\`\\n\${YELLOW}--- \${title} ---\${RESET}\`</span>);
<span class="ln">17</span>}
</pre>
<p>Prints a blank line then a yellow section heading like <code>--- Android Checks ---</code>.
The leading <code>\\n</code> adds vertical whitespace so sections are visually separated.</p>

<pre>
<span class="ln">19</span><span class="kw">function</span> <span class="fn">suggestions</span>(list) {
<span class="ln">20</span>  <span class="kw">if</span> (list.length === <span class="num">0</span>) <span class="kw">return</span>;     <span class="cm">// nothing failed — skip the block entirely</span>
<span class="ln">21</span>  console.<span class="fn">log</span>(<span class="str">\`\\n\${YELLOW}Suggestions:\${RESET}\`</span>);
<span class="ln">22</span>  <span class="kw">for</span> (<span class="kw">const</span> suggestion <span class="op">of</span> list) {
<span class="ln">23</span>    console.<span class="fn">log</span>(<span class="str">\`  - \${suggestion}\`</span>);  <span class="cm">// two-space indent + dash prefix</span>
<span class="ln">24</span>  }
<span class="ln">25</span>}
</pre>
<p>Iterates over every suggestion string and prints it as a bullet. Called once at the very end
of <code>firebase-config-doctor.js</code> with the combined array from all three check modules.</p>

<pre>
<span class="ln">27</span>module.exports = { pass, fail, header, suggestions };
</pre>
<p>Exports all four functions so any file that does <code>require('../utils/logger')</code>
can destructure the ones it needs.</p>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>3. File: firebase-config-doctor.js (Entry Point)</h2>

<div class="summary-box">
  <b>Purpose:</b> The file Node.js runs first. It owns no check logic — its only job is to
  parse the CLI arguments, validate the project folder exists, call the three check modules
  in order, collect their suggestions, and print the final action list.
</div>

<h3>Imports</h3>
<pre>
<span class="ln"> 1</span><span class="kw">const</span> fs   = require(<span class="str">'fs'</span>);    <span class="cm">// Node built-in — file system: existsSync, readFileSync</span>
<span class="ln"> 2</span><span class="kw">const</span> path = require(<span class="str">'path'</span>);  <span class="cm">// Node built-in — path.resolve, path.join</span>
<span class="ln"> 3</span>
<span class="ln"> 4</span><span class="kw">const</span> { header, suggestions } = require(<span class="str">'./utils/logger'</span>);
<span class="ln"> 5</span><span class="kw">const</span> { runAndroidChecks }    = require(<span class="str">'./checks/android'</span>);
<span class="ln"> 6</span><span class="kw">const</span> { runIosChecks }        = require(<span class="str">'./checks/ios'</span>);
<span class="ln"> 7</span><span class="kw">const</span> { runPackageCheck }     = require(<span class="str">'./checks/packageCheck'</span>);
</pre>
<p>Only <code>header</code> and <code>suggestions</code> are pulled from logger — the check
files import <code>pass</code> and <code>fail</code> themselves. This entry point never calls
<code>pass()</code> or <code>fail()</code> directly.</p>

<h3>CLI argument parsing</h3>
<pre>
<span class="ln"> 9</span><span class="kw">const</span> args = process.argv.<span class="fn">slice</span>(<span class="num">2</span>);
</pre>
<p><code>process.argv</code> is the raw argument array Node provides. Index 0 is always the
<code>node</code> executable path. Index 1 is always the script path. Everything from index 2
onwards is what the user actually typed. <code>.slice(2)</code> removes the first two items,
leaving only the user-provided arguments.</p>

<pre>
<span class="ln">10</span><span class="kw">let</span> projectPath = <span class="kw">null</span>;
<span class="ln">11</span><span class="kw">const</span> projectFlagIndex = args.<span class="fn">indexOf</span>(<span class="str">'--project'</span>);
<span class="ln">12</span><span class="kw">if</span> (projectFlagIndex !== -<span class="num">1</span>) {
<span class="ln">13</span>  projectPath = args[projectFlagIndex + <span class="num">1</span>];   <span class="cm">// the token immediately after --project</span>
<span class="ln">14</span>} <span class="kw">else</span> {
<span class="ln">15</span>  projectPath = args[<span class="num">0</span>];                       <span class="cm">// first positional argument</span>
<span class="ln">16</span>}
</pre>
<p>Supports both:</p>
<ul>
  <li><code>node firebase-config-doctor.js ./my-app</code> — positional form</li>
  <li><code>npm run firebase-config-doctor -- --project ./my-app</code> — flag form</li>
</ul>
<p><code>args.indexOf('--project')</code> returns <code>-1</code> if the flag is absent.
When the flag exists, <code>args[projectFlagIndex + 1]</code> reads the very next token,
which is the path value.</p>

<pre>
<span class="ln">18</span><span class="kw">if</span> (!projectPath) { ... process.<span class="fn">exit</span>(<span class="num">1</span>); }
</pre>
<p>Guards against being called with no arguments at all. <code>process.exit(1)</code> exits
with a non-zero code, signalling failure to any shell script or CI system that calls this tool.</p>

<pre>
<span class="ln">22</span><span class="kw">const</span> absolutePath = path.<span class="fn">resolve</span>(projectPath);
</pre>
<p><code>path.resolve()</code> converts any relative path (e.g., <code>./my-app</code> or
<code>../other-project</code>) to a full absolute path based on the current working directory.
All subsequent file operations use this absolute path so they work regardless of where the user
ran the command from.</p>

<pre>
<span class="ln">24</span><span class="kw">if</span> (!fs.<span class="fn">existsSync</span>(absolutePath)) {
<span class="ln">25</span>  console.<span class="fn">log</span>(<span class="str">\`Error: Project folder not found: \${absolutePath}\`</span>);
<span class="ln">26</span>  process.<span class="fn">exit</span>(<span class="num">1</span>);
<span class="ln">27</span>}
</pre>
<p>Early exit before any checks run. Prevents confusing "file not found" errors from deep
inside the check functions when the project path itself is wrong.</p>

<h3>Running the checks</h3>
<pre>
<span class="ln">30</span>header(<span class="str">'Android Checks'</span>);
<span class="ln">31</span><span class="kw">const</span> androidSuggestions = <span class="fn">runAndroidChecks</span>(absolutePath);
<span class="ln">32</span>
<span class="ln">33</span>header(<span class="str">'iOS Checks'</span>);
<span class="ln">34</span><span class="kw">const</span> iosSuggestions = <span class="fn">runIosChecks</span>(absolutePath);
<span class="ln">35</span>
<span class="ln">36</span>header(<span class="str">'React Native Firebase'</span>);
<span class="ln">37</span><span class="kw">const</span> packageSuggestions = <span class="fn">runPackageCheck</span>(absolutePath);
</pre>
<p>Each <code>run*</code> function prints its own pass/fail lines as a side effect and returns
an array of strings. An empty array means all checks in that section passed.</p>

<h3>Consolidating and printing suggestions</h3>
<pre>
<span class="ln">40</span><span class="kw">const</span> allSuggestions = [
<span class="ln">41</span>  ...androidSuggestions,
<span class="ln">42</span>  ...iosSuggestions,
<span class="ln">43</span>  ...packageSuggestions,
<span class="ln">44</span>];
<span class="ln">45</span><span class="fn">suggestions</span>(allSuggestions);
</pre>
<p>The spread operator (<code>...</code>) flattens three arrays into one. If all checks passed
all three arrays are empty and the combined array is empty too — <code>suggestions()</code>
then exits immediately without printing anything.</p>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>4. File: checks/android.js</h2>

<div class="summary-box">
  <b>Purpose:</b> Runs the three Android Firebase checks. Exports one public function:
  <code>runAndroidChecks(projectPath)</code>. The three internal check functions are private
  (not exported) — they are only called by <code>runAndroidChecks</code>.
</div>

<h3>Function: checkGoogleServicesJson(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runAndroidChecks()
  <h4>Calls</h4> fs.existsSync(), pass(), fail()
  <h4>Returns</h4> boolean — true if file found
</div>
<pre>
<span class="ln"> 1</span><span class="kw">function</span> <span class="fn">checkGoogleServicesJson</span>(projectPath) {
<span class="ln"> 2</span>  <span class="kw">const</span> filePath = path.<span class="fn">join</span>(projectPath, <span class="str">'android'</span>, <span class="str">'app'</span>, <span class="str">'google-services.json'</span>);
<span class="ln"> 3</span>  <span class="kw">if</span> (fs.<span class="fn">existsSync</span>(filePath)) {
<span class="ln"> 4</span>    <span class="fn">pass</span>(<span class="str">'google-services.json found'</span>);
<span class="ln"> 5</span>    <span class="kw">return true</span>;
<span class="ln"> 6</span>  } <span class="kw">else</span> {
<span class="ln"> 7</span>    <span class="fn">fail</span>(<span class="str">'google-services.json missing'</span>);
<span class="ln"> 8</span>    <span class="kw">return false</span>;
<span class="ln"> 9</span>  }
<span class="ln">10</span>}
</pre>
<p><code>path.join()</code> builds the path with the correct separator for the OS (forward slash
on macOS/Linux, backslash on Windows). <code>fs.existsSync()</code> returns <code>true</code>
immediately if the file or directory exists, without reading its contents.</p>

<h3>Function: checkGoogleServicesPlugin(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runAndroidChecks()
  <h4>Calls</h4> fs.existsSync(), fs.readFileSync(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<pre>
<span class="ln"> 1</span><span class="kw">function</span> <span class="fn">checkGoogleServicesPlugin</span>(projectPath) {
<span class="ln"> 2</span>  <span class="kw">const</span> filePath = path.<span class="fn">join</span>(projectPath, <span class="str">'android'</span>, <span class="str">'app'</span>, <span class="str">'build.gradle'</span>);
<span class="ln"> 3</span>  <span class="kw">if</span> (!fs.<span class="fn">existsSync</span>(filePath)) {
<span class="ln"> 4</span>    <span class="fn">fail</span>(<span class="str">'android/app/build.gradle not found'</span>);
<span class="ln"> 5</span>    <span class="kw">return false</span>;
<span class="ln"> 6</span>  }
<span class="ln"> 7</span>  <span class="kw">const</span> content = fs.<span class="fn">readFileSync</span>(filePath, <span class="str">'utf8'</span>);
<span class="ln"> 8</span>  <span class="kw">const</span> hasPlugin = content.<span class="fn">includes</span>(<span class="str">'com.google.gms.google-services'</span>);
<span class="ln"> 9</span>  <span class="kw">if</span> (hasPlugin) { <span class="fn">pass</span>(...); <span class="kw">return true</span>; }
<span class="ln">10</span>  <span class="fn">fail</span>(...); <span class="kw">return false</span>;
<span class="ln">11</span>}
</pre>
<p><code>fs.readFileSync(filePath, 'utf8')</code> reads the entire file as a plain string.
The second argument <code>'utf8'</code> tells Node to decode bytes as UTF-8 text rather than
returning a raw Buffer object. <code>String.includes()</code> is a simple substring search —
no regex needed because we are looking for an exact, unique string.</p>

<h3>Function: checkPackageNameMatch(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runAndroidChecks()
  <h4>Calls</h4> fs.existsSync(), fs.readFileSync(), JSON.parse(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<p>This is the most complex Android check. It reads two files and compares a value from each.</p>
<pre>
<span class="ln"> 1</span><span class="cm">// Step A — read and parse google-services.json</span>
<span class="ln"> 2</span><span class="kw">let</span> googleServices;
<span class="ln"> 3</span><span class="kw">try</span> {
<span class="ln"> 4</span>  <span class="kw">const</span> rawJson = fs.<span class="fn">readFileSync</span>(googleServicesPath, <span class="str">'utf8'</span>);
<span class="ln"> 5</span>  googleServices = JSON.<span class="fn">parse</span>(rawJson);          <span class="cm">// throws if malformed</span>
<span class="ln"> 6</span>} <span class="kw">catch</span> (err) {
<span class="ln"> 7</span>  <span class="fn">fail</span>(<span class="str">'google-services.json is not valid JSON'</span>);
<span class="ln"> 8</span>  <span class="kw">return false</span>;
<span class="ln"> 9</span>}
</pre>
<p>The <code>try/catch</code> block handles corrupted or hand-edited JSON gracefully.
<code>JSON.parse()</code> throws a <code>SyntaxError</code> on any malformed content;
without the try/catch that error would crash the whole tool with an unformatted stack trace.</p>

<pre>
<span class="ln">11</span><span class="cm">// Step B — extract package_name with safe optional chaining</span>
<span class="ln">12</span><span class="kw">const</span> client      = googleServices.client &amp;&amp; googleServices.client[<span class="num">0</span>];
<span class="ln">13</span><span class="kw">const</span> packageName =
<span class="ln">14</span>  client &amp;&amp;
<span class="ln">15</span>  client.client_info &amp;&amp;
<span class="ln">16</span>  client.client_info.android_client_info &amp;&amp;
<span class="ln">17</span>  client.client_info.android_client_info.package_name;
</pre>
<p>The chained <code>&amp;&amp;</code> operators implement safe property access. If any intermediate
value is <code>null</code> or <code>undefined</code>, the whole expression short-circuits to
<code>undefined</code> instead of throwing a <code>TypeError</code>. This gracefully handles
google-services.json files that are valid JSON but have an unexpected structure.</p>

<pre>
<span class="ln">19</span><span class="cm">// Step C — extract applicationId from build.gradle line by line</span>
<span class="ln">20</span><span class="kw">let</span> applicationId = <span class="kw">null</span>;
<span class="ln">21</span><span class="kw">for</span> (<span class="kw">const</span> line <span class="op">of</span> gradleContent.<span class="fn">split</span>(<span class="str">'\\n'</span>)) {
<span class="ln">22</span>  <span class="kw">const</span> trimmed = line.<span class="fn">trim</span>();
<span class="ln">23</span>  <span class="kw">if</span> (trimmed.<span class="fn">startsWith</span>(<span class="str">'applicationId'</span>)) {
<span class="ln">24</span>    <span class="kw">const</span> match = trimmed.<span class="fn">match</span>(<span class="str">/applicationId\\s+"([^"]+)"/</span>);
<span class="ln">25</span>    <span class="kw">if</span> (match) { applicationId = match[<span class="num">1</span>]; <span class="kw">break</span>; }
<span class="ln">26</span>  }
<span class="ln">27</span>}
</pre>
<p><code>.split('\\n')</code> breaks the file into individual lines. <code>.trim()</code> removes
leading tabs/spaces so the <code>startsWith</code> check works regardless of indentation.
The regex <code>/applicationId\\s+"([^"]+)"/</code> matches the Gradle syntax
<code>applicationId "com.example.app"</code>: <code>\\s+</code> allows one or more spaces
between the keyword and the value, and <code>[^"]+</code> captures everything between the quotes.
<code>match[1]</code> is the first capture group — the actual package name string.
<code>break</code> stops the loop as soon as we find the first match.</p>

<h3>Function: runAndroidChecks(projectPath) — the public API</h3>
<div class="call-box">
  <h4>Called by</h4> firebase-config-doctor.js
  <h4>Calls</h4> checkGoogleServicesJson(), checkGoogleServicesPlugin(), checkPackageNameMatch()
  <h4>Returns</h4> string[] — one suggestion per failed check, empty if all passed
</div>
<pre>
<span class="ln"> 1</span><span class="kw">function</span> <span class="fn">runAndroidChecks</span>(projectPath) {
<span class="ln"> 2</span>  <span class="kw">const</span> suggestions = [];
<span class="ln"> 3</span>  <span class="kw">const</span> jsonExists = <span class="fn">checkGoogleServicesJson</span>(projectPath);
<span class="ln"> 4</span>  <span class="kw">if</span> (!jsonExists) suggestions.<span class="fn">push</span>(<span class="str">'Add android/app/google-services.json ...'</span>);
<span class="ln"> 5</span>  <span class="cm">// ... same pattern for the other two checks</span>
<span class="ln"> 6</span>  <span class="kw">return</span> suggestions;
<span class="ln"> 7</span>}
</pre>
<p>The design principle: each inner check function prints its own result immediately (side effect),
then returns a boolean. The wrapper <code>runAndroidChecks</code> maps each boolean failure to
a human-readable suggestion string. This separation means checks always run — even if the first
one fails, the others still execute so the developer sees all problems at once.</p>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>5. File: checks/ios.js</h2>

<div class="summary-box">
  <b>Purpose:</b> Runs three iOS Firebase checks. Exports one public function:
  <code>runIosChecks(projectPath)</code>. Contains a private helper
  <code>readPlistValue()</code> used only by <code>checkUrlScheme()</code>.
</div>

<h3>Function: checkGoogleServiceInfoPlist(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runIosChecks()
  <h4>Calls</h4> fs.existsSync(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<p>Identical pattern to <code>checkGoogleServicesJson</code> in android.js — checks whether
<code>ios/GoogleService-Info.plist</code> exists using <code>fs.existsSync()</code>.</p>

<h3>Function: checkRequiredPlistKeys(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runIosChecks()
  <h4>Calls</h4> fs.existsSync(), fs.readFileSync(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<pre>
<span class="ln"> 1</span><span class="kw">const</span> requiredKeys = [<span class="str">'GOOGLE_APP_ID'</span>, <span class="str">'GCM_SENDER_ID'</span>, <span class="str">'BUNDLE_ID'</span>, <span class="str">'API_KEY'</span>];
<span class="ln"> 2</span><span class="kw">const</span> missingKeys = [];
<span class="ln"> 3</span>
<span class="ln"> 4</span><span class="kw">for</span> (<span class="kw">const</span> key <span class="op">of</span> requiredKeys) {
<span class="ln"> 5</span>  <span class="kw">if</span> (!content.<span class="fn">includes</span>(<span class="str">\`&lt;key&gt;\${key}&lt;/key&gt;\`</span>)) {
<span class="ln"> 6</span>    missingKeys.<span class="fn">push</span>(key);
<span class="ln"> 7</span>  }
<span class="ln"> 8</span>}
</pre>
<p>Searches for each key's XML tag (<code>&lt;key&gt;GOOGLE_APP_ID&lt;/key&gt;</code>) in the
raw plist string. This avoids an XML parser while still being reliable for well-formed Apple
plists, where each key is always on its own line. The check reports only <em>which</em> keys
are missing — it never prints the key values themselves, which could be sensitive.</p>

<h3>Helper function: readPlistValue(content, key)</h3>
<div class="call-box">
  <h4>Called by</h4> checkUrlScheme() only
  <h4>Calls</h4> String.split(), String.trim(), String.match()
  <h4>Returns</h4> string | null
</div>
<pre>
<span class="ln"> 1</span><span class="kw">function</span> <span class="fn">readPlistValue</span>(content, key) {
<span class="ln"> 2</span>  <span class="kw">const</span> lines = content.<span class="fn">split</span>(<span class="str">'\\n'</span>);
<span class="ln"> 3</span>  <span class="kw">for</span> (<span class="kw">let</span> i = <span class="num">0</span>; i &lt; lines.length; i++) {
<span class="ln"> 4</span>    <span class="kw">const</span> line = lines[i].<span class="fn">trim</span>();
<span class="ln"> 5</span>    <span class="kw">if</span> (line === <span class="str">\`&lt;key&gt;\${key}&lt;/key&gt;\`</span>) {
<span class="ln"> 6</span>      <span class="kw">const</span> nextLine = lines[i + <span class="num">1</span>] &amp;&amp; lines[i + <span class="num">1</span>].<span class="fn">trim</span>();
<span class="ln"> 7</span>      <span class="kw">if</span> (nextLine) {
<span class="ln"> 8</span>        <span class="kw">const</span> match = nextLine.<span class="fn">match</span>(<span class="str">/&lt;string&gt;(.+?)&lt;\\/string&gt;/</span>);
<span class="ln"> 9</span>        <span class="kw">if</span> (match) <span class="kw">return</span> match[<span class="num">1</span>];
<span class="ln">10</span>      }
<span class="ln">11</span>    }
<span class="ln">12</span>  }
<span class="ln">13</span>  <span class="kw">return null</span>;
<span class="ln">14</span>}
</pre>
<p>Apple's XML plist format always stores a value on the line immediately after its key tag:</p>
<pre>
  &lt;key&gt;REVERSED_CLIENT_ID&lt;/key&gt;
  &lt;string&gt;com.googleusercontent.apps.12345-abc&lt;/string&gt;
</pre>
<p>The function exploits this structure: when it finds a matching <code>&lt;key&gt;</code> line,
it reads <code>lines[i + 1]</code> — the very next line. The regex
<code>/&lt;string&gt;(.+?)&lt;\/string&gt;/</code> uses a non-greedy capture group
<code>(.+?)</code> to extract only the value between the string tags. Returns <code>null</code>
if the key is not found anywhere in the file.</p>

<h3>Function: checkUrlScheme(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runIosChecks()
  <h4>Calls</h4> fs.existsSync(), fs.readFileSync(), readPlistValue(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<pre>
<span class="ln"> 1</span><span class="cm">// Read REVERSED_CLIENT_ID from GoogleService-Info.plist</span>
<span class="ln"> 2</span><span class="kw">const</span> reversedClientId = <span class="fn">readPlistValue</span>(googleServiceContent, <span class="str">'REVERSED_CLIENT_ID'</span>);
<span class="ln"> 3</span>
<span class="ln"> 4</span><span class="cm">// Check if Info.plist contains that value anywhere in its content</span>
<span class="ln"> 5</span><span class="kw">const</span> hasScheme = infoPlistContent.<span class="fn">includes</span>(reversedClientId);
<span class="ln"> 6</span>
<span class="ln"> 7</span><span class="kw">if</span> (hasScheme) {
<span class="ln"> 8</span>  <span class="cm">// Redact — show only the numeric project ID prefix, not the full value</span>
<span class="ln"> 9</span>  <span class="kw">const</span> redacted = reversedClientId.<span class="fn">replace</span>(
<span class="ln">10</span>    <span class="str">/(com\\.googleusercontent\\.apps\\.\\d+).*/</span>, <span class="str">'$1-…'</span>
<span class="ln">11</span>  );
<span class="ln">12</span>  <span class="fn">pass</span>(<span class="str">\`URL scheme registered in Info.plist (\${redacted})\`</span>);
<span class="ln">13</span>}
</pre>
<p>The redaction regex <code>/(com\.googleusercontent\.apps\.\d+).*/</code> captures everything
up to and including the numeric project ID (the digits after <code>apps.</code>), then replaces
the rest (the per-client hash) with <code>-…</code>. This ensures the output is useful for
identification while not printing the complete identifier.</p>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>6. File: checks/packageCheck.js</h2>

<div class="summary-box">
  <b>Purpose:</b> Checks the JavaScript side of Firebase setup — whether the
  <code>@react-native-firebase/app</code> npm package is declared in
  <code>package.json</code>. Exports one function: <code>runPackageCheck(projectPath)</code>.
</div>

<h3>Function: checkFirebasePackage(projectPath)</h3>
<div class="call-box">
  <h4>Called by</h4> runPackageCheck()
  <h4>Calls</h4> fs.existsSync(), fs.readFileSync(), JSON.parse(), pass(), fail()
  <h4>Returns</h4> boolean
</div>
<pre>
<span class="ln"> 1</span><span class="kw">const</span> dependencies    = packageJson.dependencies    || {};
<span class="ln"> 2</span><span class="kw">const</span> devDependencies = packageJson.devDependencies || {};
<span class="ln"> 3</span>
<span class="ln"> 4</span><span class="kw">const</span> isInstalled =
<span class="ln"> 5</span>  <span class="str">'@react-native-firebase/app'</span> <span class="op">in</span> dependencies <span class="op">||</span>
<span class="ln"> 6</span>  <span class="str">'@react-native-firebase/app'</span> <span class="op">in</span> devDependencies;
</pre>
<p>The <code>|| {}</code> on lines 1–2 is a defensive default: if either key is entirely absent
from the JSON object, it falls back to an empty object rather than throwing a TypeError when
<code>in</code> is applied to <code>undefined</code>.</p>
<p>The <code>in</code> operator checks whether a key exists in an object —
<code>'key' in obj</code> returns <code>true</code> even if the value is
<code>undefined</code>, which is exactly what we want here (the presence of the key matters,
not its version string value). This is more correct than
<code>obj['key'] !== undefined</code> for this use case.</p>
<p>Both <code>dependencies</code> and <code>devDependencies</code> are checked because some
developers accidentally install Firebase as a devDependency.</p>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>7. Function Call Graph</h2>

<p>Every function in the project, what it is called by, and what it calls:</p>

<table>
  <tr>
    <th>Function</th>
    <th>File</th>
    <th>Called by</th>
    <th>Calls</th>
    <th>Returns</th>
  </tr>
  <tr>
    <td><code>pass(msg)</code></td>
    <td>logger.js</td>
    <td>Any check function</td>
    <td>console.log</td>
    <td>void</td>
  </tr>
  <tr>
    <td><code>fail(msg)</code></td>
    <td>logger.js</td>
    <td>Any check function</td>
    <td>console.log</td>
    <td>void</td>
  </tr>
  <tr>
    <td><code>header(title)</code></td>
    <td>logger.js</td>
    <td>Entry point</td>
    <td>console.log</td>
    <td>void</td>
  </tr>
  <tr>
    <td><code>suggestions(list)</code></td>
    <td>logger.js</td>
    <td>Entry point</td>
    <td>console.log</td>
    <td>void</td>
  </tr>
  <tr>
    <td><code>checkGoogleServicesJson(path)</code></td>
    <td>android.js</td>
    <td>runAndroidChecks</td>
    <td>fs.existsSync, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>checkGoogleServicesPlugin(path)</code></td>
    <td>android.js</td>
    <td>runAndroidChecks</td>
    <td>fs.existsSync, readFileSync, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>checkPackageNameMatch(path)</code></td>
    <td>android.js</td>
    <td>runAndroidChecks</td>
    <td>fs.existsSync, readFileSync, JSON.parse, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>runAndroidChecks(path)</code></td>
    <td>android.js</td>
    <td>Entry point</td>
    <td>checkGoogleServicesJson, checkGoogleServicesPlugin, checkPackageNameMatch</td>
    <td>string[]</td>
  </tr>
  <tr>
    <td><code>checkGoogleServiceInfoPlist(path)</code></td>
    <td>ios.js</td>
    <td>runIosChecks</td>
    <td>fs.existsSync, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>checkRequiredPlistKeys(path)</code></td>
    <td>ios.js</td>
    <td>runIosChecks</td>
    <td>fs.existsSync, readFileSync, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>readPlistValue(content, key)</code></td>
    <td>ios.js</td>
    <td>checkUrlScheme</td>
    <td>String.split, String.trim, String.match</td>
    <td>string | null</td>
  </tr>
  <tr>
    <td><code>checkUrlScheme(path)</code></td>
    <td>ios.js</td>
    <td>runIosChecks</td>
    <td>fs.existsSync, readFileSync, readPlistValue, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>runIosChecks(path)</code></td>
    <td>ios.js</td>
    <td>Entry point</td>
    <td>checkGoogleServiceInfoPlist, checkRequiredPlistKeys, checkUrlScheme</td>
    <td>string[]</td>
  </tr>
  <tr>
    <td><code>checkFirebasePackage(path)</code></td>
    <td>packageCheck.js</td>
    <td>runPackageCheck</td>
    <td>fs.existsSync, readFileSync, JSON.parse, pass/fail</td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>runPackageCheck(path)</code></td>
    <td>packageCheck.js</td>
    <td>Entry point</td>
    <td>checkFirebasePackage</td>
    <td>string[]</td>
  </tr>
</table>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>8. Tests Walkthrough</h2>

<div class="summary-box">
  <b>Testing approach:</b> Each test file creates a real temporary directory on disk using
  <code>fs.mkdtempSync()</code>, writes exactly the files needed for that scenario, calls
  the check module, asserts on the returned suggestions array, then deletes the temp directory.
  No mocking. No test framework dependency — just Node's built-in <code>assert</code>
  equivalent (hand-rolled pass/fail counters).
</div>

<h3>Shared helpers used across all three test files</h3>
<pre>
<span class="ln"> 1</span><span class="cm">// Creates a real temp folder. Returns its absolute path.</span>
<span class="ln"> 2</span><span class="kw">function</span> <span class="fn">createTempProject</span>() {
<span class="ln"> 3</span>  <span class="kw">return</span> fs.<span class="fn">mkdtempSync</span>(path.<span class="fn">join</span>(os.<span class="fn">tmpdir</span>(), <span class="str">'rn-test-'</span>));
<span class="ln"> 4</span>}
</pre>
<p><code>os.tmpdir()</code> returns the OS temp directory (<code>/tmp</code> on macOS).
<code>fs.mkdtempSync(prefix)</code> creates a new unique directory by appending a random
6-character suffix to the prefix — e.g., <code>/tmp/rn-test-x3kF2p</code>.
This guarantees tests never clash with each other even if run in parallel.</p>

<pre>
<span class="ln"> 6</span><span class="kw">function</span> <span class="fn">silenceLogs</span>(fn) {
<span class="ln"> 7</span>  <span class="kw">const</span> original = console.log;
<span class="ln"> 8</span>  console.log = () => {};          <span class="cm">// replace with a no-op</span>
<span class="ln"> 9</span>  <span class="kw">const</span> result = <span class="fn">fn</span>();
<span class="ln">10</span>  console.log = original;           <span class="cm">// always restore, even if fn() throws</span>
<span class="ln">11</span>  <span class="kw">return</span> result;
<span class="ln">12</span>}
</pre>
<p>The check functions call <code>pass()</code> and <code>fail()</code> which call
<code>console.log</code>. If allowed to run during tests, their output would clutter the
test results. <code>silenceLogs</code> temporarily replaces <code>console.log</code> with an
arrow function that does nothing. The original is restored afterwards so the test's own
<code>PASS:</code> / <code>FAIL:</code> lines still print normally.</p>

<h3>8.1 tests/android.test.js — 4 tests</h3>
<table>
  <tr><th>Test</th><th>Setup</th><th>What is asserted</th></tr>
  <tr>
    <td>Missing google-services.json</td>
    <td>Empty android/app/ folder</td>
    <td>Suggestions array contains a string mentioning <code>google-services.json</code></td>
  </tr>
  <tr>
    <td>Malformed google-services.json</td>
    <td>File contains <code>{ this is not json }{</code></td>
    <td>Suggestions array contains a string mentioning package or match (parse failure triggers a suggestion)</td>
  </tr>
  <tr>
    <td>Package name mismatch</td>
    <td>JSON has <code>com.correct.app</code>; Gradle has <code>com.wrong.app</code></td>
    <td>Suggestions array contains a string mentioning applicationId or mismatch</td>
  </tr>
  <tr>
    <td>All checks passing</td>
    <td>Both files correct, identical package names, plugin line present</td>
    <td><code>suggestions.length === 0</code></td>
  </tr>
</table>

<h3>8.2 tests/ios.test.js — 4 tests</h3>
<table>
  <tr><th>Test</th><th>Setup</th><th>What is asserted</th></tr>
  <tr>
    <td>Missing GoogleService-Info.plist</td>
    <td>Empty ios/ folder</td>
    <td>Suggestions array mentions <code>GoogleService-Info.plist</code></td>
  </tr>
  <tr>
    <td>Plist missing required keys</td>
    <td>Plist has only REVERSED_CLIENT_ID — missing GOOGLE_APP_ID etc.</td>
    <td>Suggestions array mentions Firebase Console or required keys</td>
  </tr>
  <tr>
    <td>URL scheme missing in Info.plist</td>
    <td>Valid full plist; Info.plist has no CFBundleURLSchemes entry</td>
    <td>Suggestions array mentions URL scheme or CFBundleURLSchemes</td>
  </tr>
  <tr>
    <td>All checks passing</td>
    <td>Full valid plist with all keys; Info.plist contains the scheme</td>
    <td><code>suggestions.length === 0</code></td>
  </tr>
</table>

<h3>8.3 tests/packageCheck.test.js — 4 tests</h3>
<table>
  <tr><th>Test</th><th>Setup</th><th>What is asserted</th></tr>
  <tr>
    <td>Missing package.json</td>
    <td>Empty project folder</td>
    <td>At least one suggestion returned</td>
  </tr>
  <tr>
    <td>Malformed package.json</td>
    <td>File contains <code>{ this is not json }</code></td>
    <td>At least one suggestion returned</td>
  </tr>
  <tr>
    <td>Firebase package missing</td>
    <td>Valid package.json with react/react-native but no Firebase entry</td>
    <td>Suggestions array mentions <code>@react-native-firebase/app</code></td>
  </tr>
  <tr>
    <td>Firebase package present</td>
    <td>Valid package.json with <code>@react-native-firebase/app</code> in dependencies</td>
    <td><code>suggestions.length === 0</code></td>
  </tr>
</table>

<div class="page-break"></div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<h2>9. How to Run</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Node.js v14 or later (no npm install needed — zero external dependencies)</li>
</ul>

<h3>Run against the included dummy project</h3>
<pre>
<span class="cm"># From the firebase-config-doctor/ directory:</span>

<span class="cm"># Form 1 — positional argument</span>
node firebase-config-doctor.js ./dummy-rn-app

<span class="cm"># Form 2 — flag argument (npm run)</span>
npm run firebase-config-doctor -- --project ./dummy-rn-app
</pre>

<h3>Run against any React Native project</h3>
<pre>
node firebase-config-doctor.js /path/to/your/react-native-project
</pre>

<h3>Run the unit tests</h3>
<pre>
node tests/android.test.js
node tests/ios.test.js
node tests/packageCheck.test.js
</pre>

<h3>Expected output (all checks passing)</h3>
<pre>
 Firebase Config Doctor
 Checking project at: /path/to/dummy-rn-app

--- Android Checks ---
<span style="color:#4ec94e">✓</span> google-services.json found
<span style="color:#4ec94e">✓</span> Google Services plugin found in build.gradle
<span style="color:#4ec94e">✓</span> Package name matches between google-services.json and build.gradle

--- iOS Checks ---
<span style="color:#4ec94e">✓</span> GoogleService-Info.plist found
<span style="color:#4ec94e">✓</span> GoogleService-Info.plist contains all required keys
<span style="color:#4ec94e">✓</span> URL scheme registered in Info.plist (com.googleusercontent.apps.123456789-…)

--- React Native Firebase ---
<span style="color:#4ec94e">✓</span> Firebase app package (@react-native-firebase/app) is installed
</pre>

<h3>Expected output (with failures)</h3>
<pre>
--- Android Checks ---
<span style="color:#4ec94e">✓</span> google-services.json found
<span style="color:#4ec94e">✓</span> Google Services plugin found in build.gradle
<span style="color:#e94560">✗</span> Package name mismatch — google-services.json: "com.myapp" vs build.gradle: "com.myapp.dev"

--- iOS Checks ---
<span style="color:#e94560">✗</span> GoogleService-Info.plist missing
<span style="color:#e94560">✗</span> Cannot check required keys — GoogleService-Info.plist is missing
<span style="color:#e94560">✗</span> Cannot check URL scheme — GoogleService-Info.plist is missing

Suggestions:
  - Make sure applicationId in build.gradle matches package_name in google-services.json
  - Add ios/GoogleService-Info.plist — download it from the Firebase Console
  - Re-download GoogleService-Info.plist from the Firebase Console — required keys are missing
  - Add the REVERSED_CLIENT_ID value as a URL scheme in ios/Info.plist under CFBundleURLSchemes
</pre>

</body>
</html>`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'project-documentation.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML written to:', htmlPath);

// Convert to PDF using Chrome headless
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pdfPath = path.join(__dirname, 'project-documentation.pdf');

try {
  execSync(
    `"${chromePath}" --headless --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "file://${htmlPath}"`,
    { stdio: 'inherit' }
  );
  console.log('PDF written to:', pdfPath);
} catch (err) {
  console.error('Chrome PDF conversion failed:', err.message);
  console.log('The HTML file is still available at:', htmlPath);
}
