const fs = require('fs');
const path = require('path');

// Test script to verify extension build
class ExtensionTester {
  constructor() {
    this.extensionDir = path.join(__dirname, '../dist-extension');
  }

  async test() {
    console.log('🧪 Testing Chrome Extension Build...');
    
    const tests = [
      { name: 'Manifest exists', test: () => fs.existsSync(path.join(this.extensionDir, 'manifest.json')) },
      { name: 'Popup exists', test: () => fs.existsSync(path.join(this.extensionDir, 'popup.html')) },
      { name: 'Options exists', test: () => fs.existsSync(path.join(this.extensionDir, 'options.html')) },
      { name: 'Background script exists', test: () => fs.existsSync(path.join(this.extensionDir, 'background.js')) },
      { name: 'Content script exists', test: () => fs.existsSync(path.join(this.extensionDir, 'content.js')) },
      { name: 'Injected script exists', test: () => fs.existsSync(path.join(this.extensionDir, 'injected.js')) },
      { name: 'Icons directory exists', test: () => fs.existsSync(path.join(this.extensionDir, 'icons')) },
      { name: 'Manifest is valid JSON', test: () => {
        try {
          const manifest = JSON.parse(fs.readFileSync(path.join(this.extensionDir, 'manifest.json'), 'utf8'));
          return manifest.manifest_version === 3 && manifest.name && manifest.version;
        } catch {
          return false;
        }
      }}
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = test.test();
        if (result) {
          console.log(`✅ ${test.name}`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name} - Error: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Extension is ready for Chrome.');
      console.log('\n📋 Next Steps:');
      console.log('1. Open Chrome and go to chrome://extensions/');
      console.log('2. Enable "Developer mode"');
      console.log('3. Click "Load unpacked"');
      console.log(`4. Select: ${this.extensionDir}`);
      console.log('5. Test the extension!');
    } else {
      console.log('❌ Some tests failed. Check the build process.');
    }

    return failed === 0;
  }
}

// Run tests
const tester = new ExtensionTester();
tester.test().catch(console.error);
