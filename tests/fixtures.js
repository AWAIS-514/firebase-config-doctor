const REVERSED_ID = 'com.googleusercontent.apps.12345-abcde';

// Android fixtures
const GOOD_JSON = JSON.stringify({
  client: [{ client_info: { android_client_info: { package_name: 'com.example.app' } } }],
});
const GOOD_GRADLE = 'applicationId "com.example.app"\napply plugin: \'com.google.gms.google-services\'';
const BAD_GRADLE  = 'applicationId "com.wrong.app"\napply plugin: \'com.google.gms.google-services\'';

// iOS fixtures
const GOOD_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>GOOGLE_APP_ID</key>
  <string>1:12345:ios:abcdef</string>
  <key>GCM_SENDER_ID</key>
  <string>12345</string>
  <key>BUNDLE_ID</key>
  <string>com.example.app</string>
  <key>API_KEY</key>
  <string>FAKE_KEY</string>
  <key>REVERSED_CLIENT_ID</key>
  <string>${REVERSED_ID}</string>
</dict>
</plist>`;

const INFO_WITH_SCHEME    = `<plist><dict>\n  <key>CFBundleURLSchemes</key>\n  <array><string>${REVERSED_ID}</string></array>\n</dict></plist>`;
const INFO_WITHOUT_SCHEME = `<plist><dict><key>CFBundleIdentifier</key><string>com.example.app</string></dict></plist>`;

// Package fixtures
const PKG_WITH_FIREBASE    = JSON.stringify({ dependencies: { '@react-native-firebase/app': '^18.0.0' } });
const PKG_WITHOUT_FIREBASE = JSON.stringify({ dependencies: { react: '18.0.0' } });

module.exports = {
  GOOD_JSON,
  GOOD_GRADLE,
  BAD_GRADLE,
  GOOD_PLIST,
  INFO_WITH_SCHEME,
  INFO_WITHOUT_SCHEME,
  PKG_WITH_FIREBASE,
  PKG_WITHOUT_FIREBASE,
};
