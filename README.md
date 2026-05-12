# DECISIONS.md

## 1. Design & Scope

### Approach

The goal was a zero-dependency, read-only CLI that a developer can point at any React Native project directory and immediately get a colour-coded diagnosis of their Firebase setup — no installs, no credentials, no network calls.

All checks are **static file inspections only**. The tool never modifies files, never calls Firebase APIs, and never requires a logged-in account. This keeps the tool fast, safe to run in CI, and trivial to understand.

### Checks Implemented

#### Android (`checks/android.js`)

| # | Check | Pass condition | Fail condition |
|---|-------|---------------|----------------|
| 1 | `google-services.json` exists | File found at `android/app/google-services.json` | File absent |
| 2 | Google Services plugin applied | `android/app/build.gradle` contains `com.google.gms.google-services` | String absent or file missing |
| 3 | Package name matches | `package_name` in `google-services.json` equals `applicationId` in `build.gradle` | Either value missing, JSON invalid, or values differ |

The package-name check uses a regex anchored to the start of a trimmed line (`/^applicationId\s+"([^"]+)"/`) to avoid false matches inside comments or string values.

#### iOS (`checks/ios.js`)

| # | Check | Pass condition | Fail condition |
|---|-------|---------------|----------------|
| 1 | `GoogleService-Info.plist` exists | File found at `ios/GoogleService-Info.plist` | File absent |
| 2 | Required plist keys present | All four keys (`GOOGLE_APP_ID`, `GCM_SENDER_ID`, `BUNDLE_ID`, `API_KEY`) found in the file | Any key missing |
| 3 | URL scheme registered | `REVERSED_CLIENT_ID` value from plist is present in `ios/Info.plist` | Value absent from `Info.plist` or key not in plist |

The `REVERSED_CLIENT_ID` value is redacted in terminal output (truncated after the numeric App ID segment) so it is never printed in full — a deliberate security boundary.

#### React Native Package (`checks/packageCheck.js`)

| # | Check | Pass condition | Fail condition |
|---|-------|---------------|----------------|
| 1 | `@react-native-firebase/app` installed | Package found in `dependencies` or `devDependencies` | Key absent, `package.json` missing, or file invalid |

### Checks Deliberately Skipped

- **`google-services.json` schema validation** — JSON structure varies by Firebase project type; a schema check would produce false positives for valid files.
- **Keystore / signing config** — runtime concern, not a config file check.
- **Native module linking** — depends on RN version (auto-linking vs. manual); too many variables to check statically.
- **Firebase project ID consistency across platforms** — would require parsing project IDs from both plist and JSON and knowing they belong to the same Firebase project; not reliably inferable from static files alone.
- **`google-services.json` SHA-1 fingerprint** — requires the local keystore and `keytool`; out of scope for a read-only tool.

---

## 2. AI Orchestration

### What Was Planned and Prompted

The refactor started with a targeted prompt asking the AI to read **all source files first** before touching anything. This was intentional — the most common AI refactor failure is editing a file with incomplete context, producing changes that break a dependency elsewhere. Forcing a full read phase before any write prevented that.

The prompt listed explicit rules (readable names, single-purpose functions, no dead code, no over-commenting, no behaviour change) rather than leaving intent open to interpretation. Vague prompts like "clean this up" let the AI make aesthetic choices that don't match the codebase's existing style.

### What Was Trusted

- **Structural changes**: extracting `getProjectPath()` / `validateProjectPath()` / `runAllChecks()` in the entry point was accepted without modification — the decomposition was clean and matched the intent.
- **`androidPath()` and `iosPath()` helpers**: eliminating the repeated `path.join(projectPath, 'android', 'app', ...)` boilerplate was a genuine improvement and was kept.
- **Optional chaining (`?.`)**: replacing `obj && obj.prop && obj.prop.sub` chains with `parsed?.client?.[0]?.client_info?.android_client_info?.package_name` was correct and more readable.
- **`Array.filter()` for missing keys**: replacing the `for` loop in `checkRequiredPlistKeys` with a `.filter()` pass was cleaner and accepted.
- **`FIREBASE_PACKAGE` constant in `packageCheck.js`**: extracting the repeated string literal into a named constant removed a silent duplication bug (if the string had been changed in one place but not the other).

### What Was Thrown Away or Redone

- **Merged `allDeps` spread in `packageCheck.js`**: the AI merged `dependencies` and `devDependencies` with an object spread (`{ ...deps, ...devDeps }`). This was reviewed carefully — it is safe here because we only check key presence, not values, so a duplicate key in both objects is harmless.
- **Ternary `pass/fail` pattern**: the AI collapsed `if/else { pass(); return true; } else { fail(); return false; }` blocks into ternaries. This was reviewed against each call site — all were simple boolean returns with no side-effect ordering issues, so the pattern was kept.
- **`validateProjectPath` console output**: after the AI's initial version, the function's "Checking project at:" log was repositioned outside the function in the entry point to keep `validateProjectPath` a pure validator. This was a deliberate manual correction after reviewing the generated output.
- **Over-commenting**: the original source had section-divider comment blocks (`// ---...---`) around every function. The AI removed nearly all of them. The few remaining comments (the `REVERSED_CLIENT_ID` redaction rationale, the plist parser note) are non-obvious WHY comments and were kept deliberately.

### Driving the Tool

The AI was used as a fast, accurate syntactic transformer — not as an architect. Every generated file was read back line by line before accepting. The key discipline was: **the AI proposes, the developer decides**. When the AI's suggestion was correct for the wrong reason (e.g. the `allDeps` spread works but could silently mask a bug if value-equality mattered), that was noted and the logic was validated independently before accepting.

---

## 3. The Next Step

Given more time, the highest-value additions would be, in priority order:

1. **Structured check results instead of side-effect logging**
   Currently each check function calls `pass()` / `fail()` as a side effect and returns a boolean. A better design returns `{ ok: boolean, message: string, suggestion?: string }` from each check. The runner then owns all output. This makes checks unit-testable without capturing stdout and allows output formats (JSON, CI annotations) without touching check logic.

2. **`--json` output flag**
   Many CI pipelines consume structured output. Adding `--json` would print a machine-readable results object, making the tool usable as a pre-flight step in GitHub Actions or Bitrise without screen-scraping.

3. **Bundle ID cross-check (iOS)**
   Verify that `BUNDLE_ID` in `GoogleService-Info.plist` matches the `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project (`ios/*.xcodeproj/project.pbxproj`). This is the iOS equivalent of the Android package-name check and is a very common misconfiguration.

4. **`google-services.json` × `GoogleService-Info.plist` project consistency**
   Extract the Firebase project ID from both files and verify they reference the same Firebase project. Currently a developer could accidentally use an Android config from Project A and an iOS config from Project B; the tool would pass all per-platform checks but the app would behave inconsistently.

5. **Watch mode (`--watch`)**
   Re-run checks on file change (using `fs.watch`). Useful during initial Firebase setup when the developer is iterating on config files and wants instant feedback without re-running the CLI manually.
