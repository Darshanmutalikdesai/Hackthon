/**
 * @type {import('lighthouse').Config}
 */
const fs = require('fs');
const path = require('path');

// Find Chrome/Chromium executable
function findChrome() {
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const chromePath of possiblePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }
  return null;
}

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
    emulatedUserAgent: true,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    // Try to use specific Chrome path if available
    ...(findChrome() && {
      chromePath: findChrome(),
    }),
  },
};

