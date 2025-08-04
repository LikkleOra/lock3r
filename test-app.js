// Simple test to check if the app structure is working
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing FocusGuardian app structure...\n');

// Check if key files exist
const keyFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/models/index.ts',
  'src/lib/utils.ts',
  'src/lib/constants.ts',
  'src/components/dashboard/Dashboard.tsx',
  'src/components/focus/FocusTimer.tsx',
  'src/components/blocks/BlockManager.tsx'
];

let allFilesExist = true;

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📊 Summary:');
if (allFilesExist) {
  console.log('✅ All key files are present!');
  console.log('🚀 The app should be ready for development and testing.');
} else {
  console.log('❌ Some files are missing. Please check the missing files above.');
}

console.log('\n🔧 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');